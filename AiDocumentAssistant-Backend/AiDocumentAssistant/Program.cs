using AiDocumentAssistant.Data;
using AiDocumentAssistant.Interfaces;
using AiDocumentAssistant.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using System;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

// Read connection string and configure MySQL
var connectionString = builder.Configuration
    .GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        connectionString,
        new MySqlServerVersion(new Version(8, 0, 36))
    )
);

//builder.Services.AddHttpClient<IAIService, OllamaAIService>(
//    (serviceProvider, client) =>
//    {
//        var configuration =
//            serviceProvider.GetRequiredService<IConfiguration>();

//        client.BaseAddress = new Uri(
//            configuration["Ollama:BaseUrl"]
//            ?? "http://localhost:11434/");

//        client.Timeout = TimeSpan.FromMinutes(5);
//    });

var ollamaBaseUrl =
    builder.Configuration["Ollama:BaseUrl"]
    ?? "http://localhost:11434/";

var ollamaModel =
    builder.Configuration["Ollama:Model"]
    ?? "llama3.2:1b";

#pragma warning disable SKEXP0070
builder.Services.AddOllamaChatCompletion(
    modelId: ollamaModel,
    endpoint: new Uri(ollamaBaseUrl));
#pragma warning restore SKEXP0070

builder.Services.AddTransient(
    serviceProvider => new Kernel(serviceProvider));

builder.Services.AddScoped<IAIService, SemanticKernelAIService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


//
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<IDocumentProcessor, DocumentProcessor>();


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseCors("ReactFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
