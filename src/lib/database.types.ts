export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string; email: string | null; role: string; bio: string | null; skills: string[] };
        Insert: { id: string; full_name: string; email?: string | null; role?: string; bio?: string | null; skills?: string[] };
        Update: { full_name?: string; email?: string | null; role?: string; bio?: string | null; skills?: string[] };
        Relationships: [];
      };
      jobs: {
        Row: { id: string; title: string; company: string | null; location: string | null; description: string | null };
        Insert: { id?: string; title: string; company?: string | null; location?: string | null; description?: string | null };
        Update: { title?: string; company?: string | null; location?: string | null; description?: string | null };
        Relationships: [];
      };
      matches: {
        Row: { id: string; profile_id: string; job_id: string };
        Insert: { id?: string; profile_id: string; job_id: string };
        Update: { profile_id?: string; job_id?: string };
        Relationships: [
          {
            foreignKeyName: 'matches_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'matches_job_id_fkey';
            columns: ['job_id'];
            isOneToOne: false;
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
