import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, type InviteInput } from "@/services/api/users";

export function useCompanyUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.list(),
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteInput) => usersApi.invite(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
