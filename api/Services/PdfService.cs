using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using api.Entities;

namespace api.Services;

public interface IPdfService
{
    byte[] GenerateMeetingMinutesPdf(Meeting meeting);
}

public class PdfService : IPdfService
{
    public byte[] GenerateMeetingMinutesPdf(Meeting meeting)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var document = Document.Create(container =>
        {
            container.Page(page =>
        
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Element(Header);
                page.Content().Element(Content);
                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });

            void Header(IContainer c)
            {
                c.Column(col =>
                {
                    col.Item().Text(meeting.Title).FontSize(20).Bold();
                    col.Item().PaddingTop(5).Row(row =>
                    {
                        row.RelativeItem().Text($"Date: {meeting.MeetingDate:yyyy-MM-dd HH:mm}");
                        row.RelativeItem().Text($"Duration: {meeting.DurationMinutes} min");
                    });
                    col.Item().Text($"Location: {meeting.Location ?? "N/A"}");
                    col.Item().Text($"Participants: {meeting.Participants ?? "N/A"}");
                    col.Item().PaddingVertical(5).LineHorizontal(1);
                });
            }

            void Content(IContainer c)
            {
                if (meeting.Minutes == null) return;

                c.Column(col =>
                {
                    // Agenda
                    col.Item().PaddingTop(10).Text("Agenda").FontSize(14).Bold();
                    foreach (var item in meeting.Minutes.Agenda)
                        col.Item().PaddingLeft(10).Text($"• {item}");

                    // Key Points
                    col.Item().PaddingTop(10).Text("Key Points").FontSize(14).Bold();
                    foreach (var item in meeting.Minutes.KeyPoints)
                        col.Item().PaddingLeft(10).Text($"• {item}");

                    // Decisions
                    col.Item().PaddingTop(10).Text("Decisions").FontSize(14).Bold();
                    foreach (var item in meeting.Minutes.Decisions)
                        col.Item().PaddingLeft(10).Text($"• {item}");

                    // Action Items
                    col.Item().PaddingTop(10).Text("Action Items").FontSize(14).Bold();
                    col.Item().PaddingTop(5).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(3);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(1);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Description").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Assigned To").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Due Date").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Status").Bold();
                        });

                        foreach (var action in meeting.Minutes.ActionItems)
                        {
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(action.Description);
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(action.AssignedTo ?? "Unassigned");
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(action.DueDate?.ToString("yyyy-MM-dd") ?? "No date");
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(action.Status.ToString());
                        }
                    });

                    // Transcript
                    if (meeting.Transcript != null)
                    {
                        col.Item().PageBreak();
                        col.Item().Text("Transcript").FontSize(14).Bold();
                        col.Item().PaddingTop(5).Text(meeting.Transcript.Text).FontSize(10);
                    }
                });
            }
        });

        return document.GeneratePdf();
    }
}
