/*
  Warnings:

  - Added the required column `total` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "available" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "petType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Room" ("available", "capacity", "createdAt", "id", "petType", "price", "type", "updatedAt") SELECT "available", "capacity", "createdAt", "id", "petType", "price", "type", "updatedAt" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE UNIQUE INDEX "Room_type_key" ON "Room"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
