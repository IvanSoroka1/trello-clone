# Use the full .NET 9 SDK image
FROM mcr.microsoft.com/dotnet/sdk:9.0

WORKDIR /app

# Copy csproj and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy the rest of the code
COPY . ./

# Install EF Core tools globally
RUN dotnet tool install --global dotnet-ef --version 9.0.8
ENV PATH="$PATH:/root/.dotnet/tools"

# Publish the project
RUN dotnet publish -c Release -o /app/publish

WORKDIR /app/publish

ENV ASPNETCORE_URLS=http://+:5000

# Expose the port your backend uses
EXPOSE 5000

# Run EF Core migrations first, then start the backend
CMD dotnet ef database update --project /app --startup-project /app && dotnet server.dll