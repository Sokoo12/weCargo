// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {

   // Get the headers
  const headerList = await headers();
  const svixId = headerList.get('svix-id');
  const svixTimestamp = headerList.get('svix-timestamp');
  const svixSignature = headerList.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error occurred -- no svix headers', { status: 400 });
  }

   // Get the body
   const payload = await request.json();


// Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let evt;


   // Verify the payload with the headers
  try {
    evt = wh.verify(JSON.stringify(payload), {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as any;
  } catch (err) {
    return new Response('Error verifying webhook', { status: 400 });
  }

  const { id, username, first_name, last_name, email_addresses, primary_email_address_id } = evt.data;
  const email = email_addresses.find((email: any) => email.id === primary_email_address_id)?.email_address;

  switch (evt.type) {
    case 'user.created':
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email,
          username: username,
          firstName: first_name,
          lastName: last_name,
          role: 'ADMIN', // Default role
        },
      });
      
      break;

    case 'user.updated':
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email,
          username: username,
          firstName: first_name,
          lastName: last_name,
        },
      });
      break;

    case 'user.deleted':
      await prisma.user.delete({
        where: { clerkId: id },
      });
      break;
  }

  console.log(`Webhook with and ID of ${id} and type of ${evt.type}`);
  console.log("Webhook body:", payload);

  return new Response('Webhook received', { status: 200 });

}