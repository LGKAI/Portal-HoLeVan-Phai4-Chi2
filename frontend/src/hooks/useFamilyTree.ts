import { useState, useEffect, useCallback } from 'react';
import { memberService } from '../services/memberService';
import { Member } from '../types';

export const useFamilyTree = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = useCallback(async () => {
    try {
      setLoading(true);
      const data = await memberService.getTree();
      setMembers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu gia phả');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return { members, loading, error, refetch: fetchTree };
};
