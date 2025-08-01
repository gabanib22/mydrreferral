CREATE TABLE [dbo].[ErrorLogs] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [Subject]     NVARCHAR (300) NULL,
    [Description] NVARCHAR (MAX) NULL,
    [Response]    NVARCHAR (MAX) NULL,
    [CreatedBy]   NVARCHAR (50)  NULL,
    [CreatedOn]   DATETIME       NULL,
    CONSTRAINT [PK_ErrorLogs] PRIMARY KEY CLUSTERED ([Id] ASC)
);

