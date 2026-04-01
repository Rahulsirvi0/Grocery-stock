import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ykbrevfkdjtqhrmhjknx.supabase.co"
const supabaseAnonKey = "sb_publishable_Sm5iwIQSZxpqDIPQ7SI9CA_1OaLDqRR"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export async function getStatistics() {
  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) {
    console.error(error)
    return {
      totalProducts: 0,
      availableItems: 0,
      lowStockItems: 0,
      outOfStockItems: 0
    }
  }

  const totalProducts = data.length
  const availableItems = data.filter(p => p.quantity > 5).length
  const lowStockItems = data.filter(p => p.quantity > 0 && p.quantity <= 5).length
  const outOfStockItems = data.filter(p => p.quantity === 0).length

  return {
    totalProducts,
    availableItems,
    lowStockItems,
    outOfStockItems
  }
}

// User Authentication Functions
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    if (data.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()

      if (profileError) throw profileError

      return { 
        data: {
          user: data.user,
          profile: profileData
        }, 
        error: null 
      }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error }
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error

    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) throw profileError

      return { 
        data: {
          ...profile,
          email: user.email
        }, 
        error: null 
      }
    }

    return { data: null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function initializeSampleData() {

  const { data } = await supabase
    .from('products')
    .select('*')

  if (data && data.length > 0) return

  await supabase
    .from('products')
    .insert([
      { name: 'Rice', quantity: 20, price: 50 },
      { name: 'Sugar', quantity: 10, price: 40 },
      { name: 'Milk', quantity: 3, price: 25 },
      { name: 'Bread', quantity: 0, price: 30 }
    ])
}

