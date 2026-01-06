using api.Entities;

namespace api.Services;

public interface IOpenAIService
{
    Task GenerateMinutesAsync(Meeting meeting);
}