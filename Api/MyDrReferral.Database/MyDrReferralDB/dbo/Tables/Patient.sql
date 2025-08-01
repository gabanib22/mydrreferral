CREATE TABLE [dbo].[Patient] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [Name]        NVARCHAR (150) NULL,
    [RrlfById]    INT            NULL,
    [CreatedDate] DATETIME       CONSTRAINT [DF_Patient_CreatedDate] DEFAULT (getdate()) NULL,
    CONSTRAINT [PK_Patient] PRIMARY KEY CLUSTERED ([Id] ASC)
);

