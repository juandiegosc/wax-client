import { useEffect, useRef, useState } from 'react';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { env } from '@/config/env';
import type { CommentDto } from '@/features/support/types/support.types';

export const useSupportHub = (ticketId: string) => {
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!ticketId) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${env.supportHubUrl}?ticketId=${ticketId}`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.on('LoadComments', (initial: CommentDto[]) => {
      setComments(initial);
    });

    connection.on('CommentAdded', (comment: CommentDto) => {
      setComments((prev) => [...prev, comment]);
    });

    connection.onreconnected(() => setIsConnected(true));
    connection.onreconnecting(() => setIsConnected(false));
    connection.onclose(() => setIsConnected(false));

    connection
      .start()
      .then(() => {
        if (connectionRef.current === connection) setIsConnected(true);
      })
      .catch(() => {});

    return () => {
      connectionRef.current = null;
      connection.stop();
      setIsConnected(false);
      setComments([]);
    };
  }, [ticketId]);

  const sendComment = async (body: string) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== HubConnectionState.Connected) return;
    await conn.invoke('SendComment', { body, ticketId });
  };

  return { comments, isConnected, sendComment };
};
