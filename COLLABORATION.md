# 👥 MeetMind - Team Collaboration Guide

## Team Members
- **waelhachem25** - Backend Developer
- **alimansour77** - Frontend & Database Developer

---

## 📂 Work Division

### waelhachem25 - BACKEND (api/)
**Your Folders:**
- `api/Controllers/` - API endpoints
- `api/Services/` - Business logic (PdfService, EmailService, etc.)
- `api/Entities/` - Database models
- `api/Program.cs` - Main API configuration
- `api/Migrations/` - Database migrations (created by backend)

**Your Branch:** `backend-development`

**Your Daily Workflow:**
```bash
# 1. Start working
cd /Users/waelhachem/meetmind
git checkout backend-development
git pull origin backend-development

# 2. Make your backend changes in api/ folder

# 3. Save and upload
git add api/
git commit -m "Backend: describe what you did"
git push origin backend-development
```

---

### alimansour77 - FRONTEND & DATABASE (web/, mobile/, SQL)
**Your Folders:**
- `web/src/` - React web application
- `mobile/src/` - React Native mobile app
- `*.sql` files - Database scripts
- `docker-compose.yml` - Database configuration

**Your Branch:** `frontend-development`

**Your Daily Workflow:**
```bash
# 1. Clone the project (first time only)
git clone https://github.com/waelhachem25/meetmind.git
cd meetmind

# 2. Create and switch to your branch
git checkout -b frontend-development

# 3. Make your frontend/database changes

# 4. Save and upload
git add web/ mobile/ *.sql docker-compose.yml
git commit -m "Frontend: describe what you did"
git push origin frontend-development
```

---

## 🔄 Integration Workflow

### When Backend is Ready:
1. **waelhachem25** creates Pull Request: `backend-development` → `main`
2. **alimansour77** reviews and approves
3. Merge to `main`

### When Frontend is Ready:
1. **alimansour77** creates Pull Request: `frontend-development` → `main`
2. **waelhachem25** reviews and approves
3. Merge to `main`

---

## 📋 Communication Rules

✅ **DO:**
- Always work on your assigned branch
- Commit with clear messages: "Backend: Added email service" or "Frontend: Updated login page"
- Pull latest changes before starting work
- Message each other before merging to main

❌ **DON'T:**
- Don't edit each other's folders
- Don't push directly to `main` branch
- Don't commit without pulling first

---

## 🆘 Emergency Commands

**Get latest changes:**
```bash
git pull origin your-branch-name
```

**See what you changed:**
```bash
git status
```

**Undo your last commit:**
```bash
git reset HEAD~1
```

**Switch branches:**
```bash
git checkout backend-development    # For waelhachem25
git checkout frontend-development   # For alimansour77
git checkout main                   # View the stable version
```

---

## 📞 Contact
If you get stuck, message each other immediately!

**Quick sync before pushing:**
"Hey, I'm about to push backend updates to my branch"
"Frontend ready for testing, check my branch"
