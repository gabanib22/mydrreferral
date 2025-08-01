CREATE TABLE [dbo].[tblAddress] (
    [Id]            INT            IDENTITY (1, 1) NOT NULL,
    [UserId]        INT            NOT NULL,
    [FirmName]      NVARCHAR (100) NULL,
    [address1]      NVARCHAR (300) NULL,
    [address2]      NVARCHAR (300) NULL,
    [district]      NVARCHAR (50)  NULL,
    [city]          NVARCHAR (50)  NULL,
    [postalCode]    NVARCHAR (50)  NULL,
    [state]         NVARCHAR (50)  NULL,
    [EstablishedOn] DATE           NULL,
    [lat]           DECIMAL (8, 6) NULL,
    [long]          DECIMAL (9, 6) NULL,
    [isHome]        BIT            CONSTRAINT [DF_tblAddress_isHome] DEFAULT ((1)) NOT NULL,
    [isActive]      BIT            CONSTRAINT [DF_tblAddress_isActive] DEFAULT ((1)) NOT NULL,
    [isDelete]      BIT            CONSTRAINT [DF_tblAddress_isDelete] DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_tblAddress] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_tblAddress_tblAddress] FOREIGN KEY ([Id]) REFERENCES [dbo].[tblAddress] ([Id])
);

