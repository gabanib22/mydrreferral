CREATE TABLE [dbo].[tblReffer] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [ConnectioionId] INT            NOT NULL,
    [PatientId]      INT            NOT NULL,
    [Notes]          NVARCHAR (500) NULL,
    [RflAmount]      INT            NOT NULL,
    [RrlfDate]       DATETIME       NULL,
    [AcceptedDate]   DATETIME       NULL,
    [IsAccepted]     BIT            CONSTRAINT [DF_tblReffer_IsAccepted] DEFAULT ((0)) NOT NULL,
    [IsDeleted]      BIT            CONSTRAINT [DF_tblReffer_IsDeleted] DEFAULT ((0)) NOT NULL,
    [Status]         INT            NULL,
    CONSTRAINT [PK_tblReffer] PRIMARY KEY CLUSTERED ([Id] ASC)
);

