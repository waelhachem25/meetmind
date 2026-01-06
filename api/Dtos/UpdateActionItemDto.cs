using api.Entities;

namespace api.Dtos;

public class UpdateActionItemDto
{
    public string? AssignedTo { get; set; }
    public DateTime? DueDate { get; set; }
    public ActionItemStatus? Status { get; set; }
}