import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { classApi } from '../api/classApi';
import type { Class, CreateClassInput } from '../types';

export const classKeys = {
  all: ['classes'] as const,
  list: () => [...classKeys.all, 'list'] as const,
};

export function useClasses() {
  return useQuery({
    queryKey: classKeys.list(),
    queryFn: () => classApi.list(),
    staleTime: 30_000,
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClassInput) => classApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all }),
  });
}

export function useUpdateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cls: Class) => classApi.update(cls),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all }),
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => classApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all }),
  });
}

export function useApproveStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: string }) =>
      classApi.approveStudent(classId, studentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all }),
  });
}

export function useRejectStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: string }) =>
      classApi.rejectStudent(classId, studentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all }),
  });
}

export function useGenerateInviteCode() {
  return useMutation({
    mutationFn: ({ classId, minute }: { classId: string; minute?: number }) =>
      classApi.generateInviteCode(classId, minute),
  });
}

export function useJoinClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => classApi.joinByCode(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all }),
  });
}
