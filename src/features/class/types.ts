/**
 * Class types — match BE Go entity (quiz-app/internal/domain/entity/class.go)
 * + CLAUDE.md F3.
 */

export interface StudentInfo {
  user_id: string;
  email: string;
  name?: string;
}

export interface Class {
  _id: string;
  class_name: string;
  author_mail: string;
  user_id: string;
  test_id: string[];
  students_accept: StudentInfo[];
  students_wait: StudentInfo[];
  is_public: boolean;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateClassInput {
  class_name: string;
  is_public?: boolean;
  tags?: string[];
}

export interface InviteCodeResponse {
  /** 6-char alphanumeric uppercase per F3. */
  code: string;
  /** TTL in seconds the FE asked for. */
  expires_in: number;
}
