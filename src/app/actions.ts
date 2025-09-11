// src/app/actions.ts

'use server'; // This marks all functions in this file as Server Actions

import { redirect } from 'next/navigation';
import client from '@/lib/prisma';

export async function findApplication(formData: FormData) {
  const accessCode = formData.get('accessCode') as string;

  if (!accessCode) {
    return redirect('/?error=true');
  }

  const application = await client.application.findUnique({
    where: {
      accessCode: accessCode.trim(),
    },
  });

  if (application) {
    redirect(`/application/${accessCode}`);
  } else {
    redirect('/?error=true');
  }
}