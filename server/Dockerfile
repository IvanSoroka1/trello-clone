# Use the full .NET 9 SDK image
FROM mcr.microsoft.com/dotnet/sdk:9.0

WORKDIR /app

# Copy csproj and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy the rest of the code and publish
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# Install EF Core tools globally (optional, only if you need dotnet-ef inside container)
RUN dotnet tool install --global dotnet-ef --version 9.0.8
ENV PATH="$PATH:/root/.dotnet/tools"

WORKDIR /app/publish

ENV ASPNETCORE_URLS=http://+:5000

#RUN dotnet ef database update --no-build --project /app
# Expose the port your backend uses
EXPOSE 5000

# Run your backend
CMD ["dotnet", "server.dll"]

