using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace api.Swagger;

public class FileUploadOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // detect IFormFile directly or inside a [FromForm] DTO
        var hasFormFile = context.MethodInfo
            .GetParameters()
            .Any(p =>
                p.ParameterType == typeof(IFormFile) ||
                (p.GetCustomAttributes(typeof(FromFormAttribute), false).Any()) ||
                p.ParameterType.GetProperties().Any(prop => typeof(IFormFile).IsAssignableFrom(prop.PropertyType)));

        if (!hasFormFile) return;

        operation.RequestBody = new OpenApiRequestBody
        {
            Content =
            {
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties =
                        {
                            ["file"] = new OpenApiSchema { Type = "string", Format = "binary" }
                        },
                        Required = new HashSet<string> { "file" }
                    }
                }
            }
        };
    }
}
