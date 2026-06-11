-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "measurement_units" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "symbol" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "sensor_devices" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "sensor_devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "data_streams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "unitId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    CONSTRAINT "data_streams_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "measurement_units" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "data_streams_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "sensor_devices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sensor_data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" INTEGER NOT NULL,
    "value" REAL NOT NULL,
    "unitId" INTEGER NOT NULL,
    "streamId" INTEGER NOT NULL,
    CONSTRAINT "sensor_data_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "data_streams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "sensor_devices_key_key" ON "sensor_devices"("key");

-- CreateIndex
CREATE UNIQUE INDEX "data_streams_key_key" ON "data_streams"("key");

-- CreateIndex
CREATE INDEX "sensor_data_timestamp_idx" ON "sensor_data"("timestamp");
