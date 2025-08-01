CREATE TABLE [dbo].[tblConnections] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [SenderId]       INT            NOT NULL,
    [ReceiverId]     INT            NOT NULL,
    [IsAccepted]     BIT            CONSTRAINT [DF_tblConnections_IsAccepted] DEFAULT ((0)) NOT NULL,
    [IsRejected]     BIT            CONSTRAINT [DF_tblConnections_RejectCount] DEFAULT ((0)) NOT NULL,
    [IsDeleted]      BIT            CONSTRAINT [DF_tblConnections_IsDeleted] DEFAULT ((0)) NOT NULL,
    [Notes]          NVARCHAR (150) NULL,
    [CreatedBy]      INT            NULL,
    [CreatedDate]    DATETIME       NULL,
    [LastUpdateDate] DATETIME       NULL,
    CONSTRAINT [PK_tblConnections] PRIMARY KEY CLUSTERED ([Id] ASC)
);









