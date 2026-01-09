using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using QTip.Api.Data;
using QTip.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// We auto-migrate database on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

// Email regex pattern
var emailPattern = new Regex(
    @"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
    RegexOptions.Compiled);

// POST /api/submissions - This submits text for PII detection and tokenization
app.MapPost("/api/submissions", async (SubmitRequest request, AppDbContext db) =>
{
    var text = request.Text;
    var matches = emailPattern.Matches(text);

    var submission = new Submission
    {
        Id = Guid.NewGuid(),
        CreatedAt = DateTime.UtcNow
    };

    var tokenizedText = text;
    var classifications = new List<Classification>();

    foreach (Match match in matches)
    {
        var token = $"{{{{TKN-{Guid.NewGuid().ToString()[..8]}}}}}";

        classifications.Add(new Classification
        {
            Id = Guid.NewGuid(),
            SubmissionId = submission.Id,
            Token = token,
            OriginalValue = match.Value,
            ClassificationTag = "pii.email",
            CreatedAt = DateTime.UtcNow
        });

        tokenizedText = tokenizedText.Replace(match.Value, token);
    }

    submission.TokenizedText = tokenizedText;
    submission.Classifications = classifications;

    db.Submissions.Add(submission);
    await db.SaveChangesAsync();

    return Results.Created(
        $"/api/submissions/{submission.Id}",
        new SubmitResponse(submission.Id, classifications.Count)
    );
})
.WithName("SubmitText")
.WithOpenApi();

// GET /api/statistics - This gets total PII email count
app.MapGet("/api/statistics", async (AppDbContext db) =>
{
    var totalPiiEmails = await db.Classifications
        .Where(c => c.ClassificationTag == "pii.email")
        .CountAsync();

    return Results.Ok(new StatisticsResponse(totalPiiEmails));
})
.WithName("GetStatistics")
.WithOpenApi();

app.Run();
