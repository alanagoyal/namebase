'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { SignupFormData } from '@/components/signup-form';

export async function signup(formData: SignupFormData, idString: string, origin: string) {
  console.log(origin + `/new?ids=${idString}`)
  const supabase = createClient()
  const { email, password } = formData;
  const { error } = await supabase.auth.signUp({email, password, options: {
    emailRedirectTo: origin + `/new?ids=${idString}`
  }})

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect(`/confirm-email`)
}