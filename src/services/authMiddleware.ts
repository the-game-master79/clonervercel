import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

if (!ANON_KEY) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined');
}

export const authMiddleware = {
  validateApiKey: async (apiKey: string) => {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_value', apiKey)
      .single();

    if (error || !data) {
      throw new Error('Invalid API key');
    }

    if (!data.is_active) {
      throw new Error('API key is inactive');
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      throw new Error('API key has expired');
    }

    return data;
  },

  getUserId: async (apiKey: string): Promise<string> => {
    const keyData = await authMiddleware.validateApiKey(apiKey);
    return keyData.user_id;
  },

  getAuthHeaders: async (apiKey: string) => {
    try {
      if (!apiKey) {
        return {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        };
      }

      const keyData = await authMiddleware.validateApiKey(apiKey);
      
      // Create a JWT token that matches Supabase's expected format
      const payload = {
        aud: 'authenticated',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        sub: keyData.user_id,
        email: '',
        phone: '',
        app_metadata: {
          provider: 'apikey'
        },
        user_metadata: {},
        role: 'authenticated'
      };

      const token = jwt.sign(payload, ANON_KEY, {
        algorithm: 'HS256'
      });

      return {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      };
    } catch (error) {
      console.error('Auth middleware error:', error);
      throw new Error('Authentication failed');
    }
  },

  getClient: (apiKey: string): SupabaseClient => {
    // Create a new Supabase client for each API key request
    return createClient(SUPABASE_URL, ANON_KEY, {
      auth: {
        persistSession: false
      }
    });
  }
};
