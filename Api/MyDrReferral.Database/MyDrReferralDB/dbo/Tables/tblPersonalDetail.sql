CREATE TABLE [dbo].[tblPersonalDetail] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [UserId]      INT            NOT NULL,
    [PhotoUrl]    NVARCHAR (200) NULL,
    [BirthDate]   DATE           NULL,
    [Anniversary] DATE           NULL,
    [Degrees]     NVARCHAR (500) NULL,
    [Services]    NVARCHAR (500) NULL,
    [CreatedBy]   INT            NULL,
    [IsActive]    BIT            CONSTRAINT [DF_tblPersonalDetail_IsActive] DEFAULT ((0)) NOT NULL,
    [IsDelete]    BIT            CONSTRAINT [DF_tblPersonalDetail_IsDelete] DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_tblPersonalDetail] PRIMARY KEY CLUSTERED ([Id] ASC)
);



