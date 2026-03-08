export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
        }
        Relationships: []
      }
      country_language_targets: {
        Row: {
          country_code: string
          country_name: string
          created_at: string
          flag_emoji: string
          id: string
          language_code: string
        }
        Insert: {
          country_code: string
          country_name: string
          created_at?: string
          flag_emoji?: string
          id?: string
          language_code: string
        }
        Update: {
          country_code?: string
          country_name?: string
          created_at?: string
          flag_emoji?: string
          id?: string
          language_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "country_language_targets_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      equipment: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_thumb_url: string | null
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_thumb_url?: string | null
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_thumb_url?: string | null
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      hashtags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      ingredient_translations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          ingredient_id: string
          language_code: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          ingredient_id: string
          language_code: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          ingredient_id?: string
          language_code?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_translations_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      ingredient_types: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_thumb_url: string | null
          image_url: string | null
          name: string
          name_en: string | null
          slug: string
          type: Database["public"]["Enums"]["ingredient_type"]
          type_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_thumb_url?: string | null
          image_url?: string | null
          name: string
          name_en?: string | null
          slug: string
          type?: Database["public"]["Enums"]["ingredient_type"]
          type_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_thumb_url?: string | null
          image_url?: string | null
          name?: string
          name_en?: string | null
          slug?: string
          type?: Database["public"]["Enums"]["ingredient_type"]
          type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "ingredient_types"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          created_at: string
          flag_emoji: string
          is_active: boolean
          name: string
          native_name: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          flag_emoji?: string
          is_active?: boolean
          name: string
          native_name: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          flag_emoji?: string
          is_active?: boolean
          name?: string
          native_name?: string
          sort_order?: number
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempted_at: string
          email: string
          id: string
          ip_address: string | null
          success: boolean
        }
        Insert: {
          attempted_at?: string
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Update: {
          attempted_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      recipe_equipment: {
        Row: {
          equipment_id: string
          id: string
          recipe_id: string
        }
        Insert: {
          equipment_id: string
          id?: string
          recipe_id: string
        }
        Update: {
          equipment_id?: string
          id?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_equipment_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_hashtags: {
        Row: {
          hashtag_id: string
          id: string
          recipe_id: string
        }
        Insert: {
          hashtag_id: string
          id?: string
          recipe_id: string
        }
        Update: {
          hashtag_id?: string
          id?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_hashtags_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "hashtags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_hashtags_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          amount_unit: string | null
          amount_value: number | null
          display_text: string
          id: string
          ingredient_id: string
          recipe_id: string
          sort_order: number
        }
        Insert: {
          amount_unit?: string | null
          amount_value?: number | null
          display_text: string
          id?: string
          ingredient_id: string
          recipe_id: string
          sort_order?: number
        }
        Update: {
          amount_unit?: string | null
          amount_value?: number | null
          display_text?: string
          id?: string
          ingredient_id?: string
          recipe_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_recommendations: {
        Row: {
          id: string
          recipe_id: string
          recommended_recipe_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          recipe_id: string
          recommended_recipe_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          recipe_id?: string
          recommended_recipe_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_recommendations_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_recommendations_recommended_recipe_id_fkey"
            columns: ["recommended_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_step_translations: {
        Row: {
          id: string
          instruction: string
          language_code: string
          recipe_step_id: string
        }
        Insert: {
          id?: string
          instruction: string
          language_code: string
          recipe_step_id: string
        }
        Update: {
          id?: string
          instruction?: string
          language_code?: string
          recipe_step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_step_translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "recipe_step_translations_recipe_step_id_fkey"
            columns: ["recipe_step_id"]
            isOneToOne: false
            referencedRelation: "recipe_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_steps: {
        Row: {
          id: string
          instruction: string
          recipe_id: string
          step_number: number
        }
        Insert: {
          id?: string
          instruction: string
          recipe_id: string
          step_number: number
        }
        Update: {
          id?: string
          instruction?: string
          recipe_id?: string
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_steps_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_tags: {
        Row: {
          id: string
          recipe_id: string
          tag: string
        }
        Insert: {
          id?: string
          recipe_id: string
          tag: string
        }
        Update: {
          id?: string
          recipe_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_tags_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_translations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          language_code: string
          recipe_id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          language_code: string
          recipe_id: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          language_code?: string
          recipe_id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "recipe_translations_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          alcohol_level: Database["public"]["Enums"]["alcohol_level"]
          badge: Database["public"]["Enums"]["recipe_badge"] | null
          category: Database["public"]["Enums"]["recipe_category"]
          created_at: string
          description: string | null
          id: string
          image_thumb_url: string | null
          image_url: string | null
          is_published: boolean
          prep_time: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          alcohol_level?: Database["public"]["Enums"]["alcohol_level"]
          badge?: Database["public"]["Enums"]["recipe_badge"] | null
          category?: Database["public"]["Enums"]["recipe_category"]
          created_at?: string
          description?: string | null
          id?: string
          image_thumb_url?: string | null
          image_url?: string | null
          is_published?: boolean
          prep_time?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          alcohol_level?: Database["public"]["Enums"]["alcohol_level"]
          badge?: Database["public"]["Enums"]["recipe_badge"] | null
          category?: Database["public"]["Enums"]["recipe_category"]
          created_at?: string
          description?: string | null
          id?: string
          image_thumb_url?: string | null
          image_url?: string | null
          is_published?: boolean
          prep_time?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          created_at: string
          id: string
          is_visible: boolean
          rating: number
          recipe_id: string
          text: string
        }
        Insert: {
          author_name: string
          created_at?: string
          id?: string
          is_visible?: boolean
          rating: number
          recipe_id: string
          text: string
        }
        Update: {
          author_name?: string
          created_at?: string
          id?: string
          is_visible?: boolean
          rating?: number
          recipe_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_translations: {
        Row: {
          id: string
          key: string
          language_code: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          language_code: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          language_code?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "ui_translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_contact_rate_limited: { Args: { _email: string }; Returns: boolean }
      is_login_rate_limited: { Args: { _email: string }; Returns: boolean }
      is_review_rate_limited: {
        Args: { _author_name: string; _recipe_id: string }
        Returns: boolean
      }
    }
    Enums: {
      alcohol_level: "None" | "Light" | "Medium" | "Strong"
      app_role: "admin" | "user"
      ingredient_type:
        | "alcohol"
        | "liqueur"
        | "syrup"
        | "juice"
        | "fruit"
        | "mixer"
        | "other"
      recipe_badge: "Trending" | "Popular" | "Top 10" | "New"
      recipe_category: "cocktails" | "shots" | "non-alcoholic"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alcohol_level: ["None", "Light", "Medium", "Strong"],
      app_role: ["admin", "user"],
      ingredient_type: [
        "alcohol",
        "liqueur",
        "syrup",
        "juice",
        "fruit",
        "mixer",
        "other",
      ],
      recipe_badge: ["Trending", "Popular", "Top 10", "New"],
      recipe_category: ["cocktails", "shots", "non-alcoholic"],
    },
  },
} as const
