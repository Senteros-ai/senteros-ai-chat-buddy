export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chats: {
        Row: {
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          dream_id: string
          id: string
          user_id: string | null
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          dream_id: string
          id?: string
          user_id?: string | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          dream_id?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          created_at: string | null
          donor_id: string | null
          donor_name: string
          dream_id: string
          id: string
          message: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          donor_id?: string | null
          donor_name: string
          dream_id: string
          id?: string
          message?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          donor_id?: string | null
          donor_name?: string
          dream_id?: string
          id?: string
          message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
        ]
      }
      dreams: {
        Row: {
          amount: number
          author_id: string | null
          author_name: string
          category: Database["public"]["Enums"]["dream_category"] | null
          collected: number | null
          comments_count: number | null
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          author_id?: string | null
          author_name: string
          category?: Database["public"]["Enums"]["dream_category"] | null
          collected?: number | null
          comments_count?: number | null
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          author_id?: string | null
          author_name?: string
          category?: Database["public"]["Enums"]["dream_category"] | null
          collected?: number | null
          comments_count?: number | null
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          dream_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dream_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dream_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string | null
          content: string
          id: string
          image_url: string | null
          role: string
          thinking: string | null
          timestamp: string | null
        }
        Insert: {
          chat_id?: string | null
          content: string
          id?: string
          image_url?: string | null
          role: string
          thinking?: string | null
          timestamp?: string | null
        }
        Update: {
          chat_id?: string | null
          content?: string
          id?: string
          image_url?: string | null
          role?: string
          thinking?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_songs: {
        Row: {
          created_at: string
          id: string
          playlist_id: string
          position: number
          song_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          playlist_id: string
          position: number
          song_id: string
        }
        Update: {
          created_at?: string
          id?: string
          playlist_id?: string
          position?: number
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_songs_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number
          client_id: string
          created_at: string | null
          description: string
          id: string
          status: string
          title: string
          updated_at: string | null
          writer_id: string | null
        }
        Insert: {
          budget: number
          client_id: string
          created_at?: string | null
          description: string
          id?: string
          status?: string
          title: string
          updated_at?: string | null
          writer_id?: string | null
        }
        Update: {
          budget?: number
          client_id?: string
          created_at?: string | null
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string | null
          writer_id?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          created_at: string | null
          description: string
          id: string
          price: number
          project_id: string
          status: string
          writer_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          price: number
          project_id: string
          status?: string
          writer_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          price?: number
          project_id?: string
          status?: string
          writer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          album: string | null
          artist: string
          cover_url: string | null
          created_at: string
          duration: number
          file_url: string
          id: string
          is_approved: boolean
          title: string
          uploaded_by: string | null
        }
        Insert: {
          album?: string | null
          artist: string
          cover_url?: string | null
          created_at?: string
          duration: number
          file_url: string
          id?: string
          is_approved?: boolean
          title: string
          uploaded_by?: string | null
        }
        Update: {
          album?: string | null
          artist?: string
          cover_url?: string | null
          created_at?: string
          duration?: number
          file_url?: string
          id?: string
          is_approved?: boolean
          title?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      tracks: {
        Row: {
          audio_url: string
          cover_url: string
          created_at: string | null
          id: string
          lyrics: string | null
          plays: number | null
          title: string
          user_id: string
        }
        Insert: {
          audio_url: string
          cover_url: string
          created_at?: string | null
          id?: string
          lyrics?: string | null
          plays?: number | null
          title: string
          user_id: string
        }
        Update: {
          audio_url?: string
          cover_url?: string
          created_at?: string | null
          id?: string
          lyrics?: string | null
          plays?: number | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      writer_profiles: {
        Row: {
          bio: string
          created_at: string | null
          expertise: string[]
          hourly_rate: number
          id: string
          portfolio_items: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio: string
          created_at?: string | null
          expertise?: string[]
          hourly_rate: number
          id?: string
          portfolio_items?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string
          created_at?: string | null
          expertise?: string[]
          hourly_rate?: number
          id?: string
          portfolio_items?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_plays: {
        Args: { track_id: string }
        Returns: undefined
      }
    }
    Enums: {
      dream_category:
        | "Образование"
        | "Здоровье"
        | "Искусство"
        | "Спорт"
        | "Технологии"
        | "Экология"
        | "Благотворительность"
        | "Путешествия"
        | "Бизнес"
        | "Другое"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      dream_category: [
        "Образование",
        "Здоровье",
        "Искусство",
        "Спорт",
        "Технологии",
        "Экология",
        "Благотворительность",
        "Путешествия",
        "Бизнес",
        "Другое",
      ],
    },
  },
} as const
