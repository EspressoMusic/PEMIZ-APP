import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const statements = [
  `INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
   VALUES
     ('product-images', 'product-images', true, 2097152, ARRAY['image/jpeg','image/png','image/webp']),
     ('business-logos', 'business-logos', true, 2097152, ARRAY['image/jpeg','image/png','image/webp'])
   ON CONFLICT (id) DO UPDATE SET
     public = EXCLUDED.public,
     file_size_limit = EXCLUDED.file_size_limit,
     allowed_mime_types = EXCLUDED.allowed_mime_types`,
  `DO $$ BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_policies
       WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_public_read_products'
     ) THEN
       CREATE POLICY storage_public_read_products ON storage.objects
         FOR SELECT TO public
         USING (bucket_id = 'product-images');
     END IF;
   END $$`,
  `DO $$ BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_policies
       WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_public_read_logos'
     ) THEN
       CREATE POLICY storage_public_read_logos ON storage.objects
         FOR SELECT TO public
         USING (bucket_id = 'business-logos');
     END IF;
   END $$`,
];

try {
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
    console.log("ok:", sql.slice(0, 60).replace(/\s+/g, " "));
  }

  const buckets = await prisma.$queryRaw`
    SELECT id, name, public FROM storage.buckets ORDER BY id
  `;
  console.log("buckets:", JSON.stringify(buckets));
} catch (e) {
  console.error("error:", e.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
