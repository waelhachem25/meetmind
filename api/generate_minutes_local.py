#!/usr/bin/env python3
"""
Local AI-powered minutes extraction using pattern matching and NLP
No external API required - works offline
"""

import sys
import json
import re
from datetime import datetime, timedelta
from collections import defaultdict

def extract_agenda(text):
    """Extract agenda items from transcript"""
    agenda = []
    
    # Look for meeting title/subject
    title_match = re.search(r"(?:meeting|subject|re)[:\s]+([^\n]{10,100})", text, re.IGNORECASE)
    if title_match:
        agenda.append(title_match.group(1).strip()[:200])
    
    # Look for explicit agenda mentions
    agenda_patterns = [
        r"agenda(?:\s+items?)?[:\s]+([^\n]{10,100})",
        r"we(?:'re| are) going to (?:discuss|talk about|cover)[:\s]+([^\n]{10,100})",
        r"(?:let's|we'll|we will)\s+(?:discuss|talk about|review|cover)\s+([^\n]{10,100})",
        r"(?:topic|item)\s+\d+[:\s]+([^\n]{10,100})",
    ]
    
    for pattern in agenda_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            item = match.group(1).strip()
            if len(item) > 10 and item not in agenda and len(agenda) < 8:
                agenda.append(item[:200])
    
    # Extract topics from questions - look for mentions of proposals, reviews, updates
    topic_patterns = [
        r"(?:propose|proposal for|proposal to)\s+([^.\n]{15,100})",
        r"(?:bring up|discuss|review)\s+(?:the\s+)?([^.\n]{15,100}(?:timeline|budget|plan|status|update))",
    ]
    
    for pattern in topic_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            item = match.group(1).strip()
            if len(item) > 15 and item not in agenda and len(agenda) < 8:
                # Clean up common endings
                item = re.sub(r'\s+(?:to|for|with|by)\s*$', '', item)
                agenda.append(item[:200])
    
    return agenda[:7] if agenda else ["Meeting discussion"]

def extract_key_points(text):
    """Extract key points and important information"""
    key_points = []
    
    # Look for numerical facts and metrics
    number_patterns = [
        r"([^.\n]*\b\d+(?:\.\d+)?%[^.\n]*)",  # Percentages
        r"([^.\n]*\$\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:million|billion|thousand|k|m|b))?[^.\n]*)",  # Money
        r"([^.\n]*\b\d+(?:,\d{3})+\b[^.\n]*)",  # Large numbers
    ]
    
    for pattern in number_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            point = match.group(1).strip()
            if len(point) > 15 and point not in key_points and len(key_points) < 10:
                key_points.append(point[:250])
    
    # Look for important statements
    importance_patterns = [
        r"(?:important|crucial|critical|key|significant)[:\s]+([^.\n]{15,200})",
        r"(?:we need to|must|should|have to)\s+([^.\n]{15,200})",
        r"(?:the main|primary|biggest|major)\s+(?:issue|concern|goal|objective|priority)[:\s]+([^.\n]{15,200})",
    ]
    
    for pattern in importance_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            point = match.group(1).strip()
            if point and point not in key_points and len(key_points) < 10:
                key_points.append(point[:250])
    
    # Extract statements with strong verbs
    if len(key_points) < 5:
        strong_verb_pattern = r"([^.\n]*\b(?:increased|decreased|improved|achieved|completed|launched|implemented|approved|decided|confirmed)\b[^.\n]{10,150})"
        matches = re.finditer(strong_verb_pattern, text, re.IGNORECASE)
        for match in matches:
            point = match.group(1).strip()
            if point and point not in key_points and len(key_points) < 10:
                key_points.append(point[:250])
    
    return key_points[:10] if key_points else ["Key information discussed in meeting"]

def extract_decisions(text):
    """Extract decisions made during the meeting"""
    decisions = []
    
    decision_patterns = [
        r"(?:we(?:'ve| have)?\s+)?(?:decided|agreed|approved|chosen|selected|determined)[:\s]+to\s+([^.\n]{10,200})",
        r"(?:we(?:'ll| will)?\s+)?(?:decided|agreed|approved)\s+(?:to|that)\s+([^.\n]{10,200})",
        r"(?:the )?decision(?:\s+is|\s+was)?[:\s]+([^.\n]{10,200})",
        r"(?:we'll|we will|let's)\s+(?:go with|proceed with|move forward with|move|postpone)\s+([^.\n]{10,200})",
        r"(?:approved|greenlit|authorized)[:\s]+([^.\n]{10,200})",
        r"I recommend we\s+([^.\n]{10,200})",
    ]
    
    for pattern in decision_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            decision = match.group(1).strip()
            # Clean up the decision text
            if decision and len(decision) > 10 and decision not in decisions:
                # Remove trailing punctuation issues
                decision = re.sub(r'\s+$', '', decision)
                decisions.append(decision[:250])
    
    return decisions[:8] if decisions else ["No specific decisions recorded"]

def extract_action_items(text):
    """Extract action items with assignees"""
    action_items = []
    
    # Patterns for action items with assignee
    action_patterns = [
        r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)[,\s]+(?:can you|could you|please|you should|you need to)\s+([^.\n]{10,150})",
        r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:will|should|needs to|has to|must)\s+([^.\n]{10,150})",
        r"(?:action item|task|todo|to-?do)[:\s]+([^.\n]{10,150})",
    ]
    
    # Extract dates
    date_pattern = r"\b(?:by|due|deadline|until)\s+([A-Z][a-z]+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}/\d{1,2}(?:/\d{2,4})?|\d{4}-\d{2}-\d{2})\b"
    
    for pattern in action_patterns[:2]:  # First two have assignees
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            assignee = match.group(1).strip()
            task = match.group(2).strip()
            
            # Look for due date near this action
            context_start = max(0, match.start() - 100)
            context_end = min(len(text), match.end() + 100)
            context = text[context_start:context_end]
            
            due_date = None
            date_match = re.search(date_pattern, context, re.IGNORECASE)
            if date_match:
                due_date = date_match.group(1)
            
            action_items.append({
                "description": task[:200],
                "assignedTo": assignee,
                "dueDate": due_date,
                "status": "Pending"
            })
            
            if len(action_items) >= 8:
                break
    
    # Generic action items without clear assignee
    if len(action_items) < 3:
        generic_pattern = r"(?:we need to|must|should|have to|action item)[:\s]+([^.\n]{15,150})"
        matches = re.finditer(generic_pattern, text, re.IGNORECASE)
        for match in matches:
            task = match.group(1).strip()
            if len(action_items) < 8:
                action_items.append({
                    "description": task[:200],
                    "assignedTo": "Team",
                    "dueDate": None,
                    "status": "Pending"
                })
    
    return action_items if action_items else []

def extract_minutes_local(transcript_text):
    """
    Main extraction pipeline using local pattern matching
    No API calls required
    """
    
    print(f"🐍 Local extraction started", file=sys.stderr)
    print(f"📋 Transcript length: {len(transcript_text)} characters", file=sys.stderr)
    
    # Extract all components
    agenda = extract_agenda(transcript_text)
    key_points = extract_key_points(transcript_text)
    decisions = extract_decisions(transcript_text)
    action_items = extract_action_items(transcript_text)
    
    print(f"✅ Extracted: {len(agenda)} agenda, {len(key_points)} key points, {len(decisions)} decisions, {len(action_items)} actions", file=sys.stderr)
    
    result = {
        "agenda": agenda,
        "keyPoints": key_points,
        "decisions": decisions,
        "actionItems": action_items
    }
    
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_minutes_local.py <transcript_text>", file=sys.stderr)
        sys.exit(1)
    
    transcript = sys.argv[1]
    
    try:
        result = extract_minutes_local(transcript)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        # Return empty structure on error
        print(json.dumps({
            "agenda": ["Unable to extract agenda"],
            "keyPoints": ["Unable to extract key points"],
            "decisions": ["Unable to extract decisions"],
            "actionItems": []
        }))
        sys.exit(1)
