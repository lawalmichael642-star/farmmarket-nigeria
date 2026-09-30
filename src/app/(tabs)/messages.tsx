import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Inbox, MessageCircle, SendHorizontal } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ActionButton } from '@/components/market/ActionButton';
import { BrandHeader } from '@/components/market/BrandHeader';
import { Screen } from '@/components/market/Screen';
import { FontFamily, type MarketPalette } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useMarketTheme } from '@/context/market-theme-context';
import { ApiError, api } from '@/services/api';
import type { Conversation, ConversationMessage } from '@/types/market';

export default function MessagesScreen() {
  const params = useLocalSearchParams<{ conversationId?: string; listingId?: string; listingCrop?: string; farmerName?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;
  const { colors } = useMarketTheme();
  const styles = createStyles(colors);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState(params.conversationId ?? '');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [inboxLoading, setInboxLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(Boolean(params.conversationId));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    let active = true;
    api.getConversations()
      .then((items) => { if (active) setConversations(items); })
      .catch((cause: unknown) => { if (active) setError(messageFromError(cause)); })
      .finally(() => { if (active) setInboxLoading(false); });
    return () => { active = false; };
  }, [userId]);

  useEffect(() => {
    if (!params.listingId || !userId || activeId) return;
    let active = true;
    api.findListingConversation(params.listingId)
      .then(({ conversation }) => {
        if (!active || !conversation) return;
        setActiveConversation(conversation);
        setActiveId(conversation._id);
        router.replace({ pathname: '/(tabs)/messages', params: { conversationId: conversation._id } });
      })
      .catch((cause: unknown) => { if (active) setError(messageFromError(cause)); });
    return () => { active = false; };
  }, [activeId, params.listingId, router, userId]);

  useEffect(() => {
    if (!activeId || !userId) return;
    let active = true;
    const refreshThread = () => api.getConversation(activeId)
      .then((result) => {
        if (!active) return;
        setActiveConversation(result.conversation);
        setMessages(result.messages);
        setConversations((current) => current.map((item) => item._id === result.conversation._id ? result.conversation : item));
      })
      .catch((cause: unknown) => { if (active) setError(messageFromError(cause)); })
      .finally(() => { if (active) setThreadLoading(false); });
    void refreshThread();
    const interval = setInterval(() => { void refreshThread(); }, 5000);
    return () => { active = false; clearInterval(interval); };
  }, [activeId, userId]);

  function openConversation(conversation: Conversation) {
    setError('');
    setThreadLoading(true);
    setActiveConversation(conversation);
    setActiveId(conversation._id);
  }

  function showInbox() {
    setActiveId('');
    setActiveConversation(null);
    setMessages([]);
    setError('');
    router.replace('/(tabs)/messages');
  }

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError('');
    try {
      if (activeId) {
        const result = await api.sendMessage(activeId, body);
        setMessages((current) => [...current, result.message]);
        setConversations((current) => current.map((item) => item._id === activeId
          ? { ...item, lastMessage: body, lastMessageAt: result.message.createdAt }
          : item));
      } else if (params.listingId) {
        const result = await api.startConversation({ listingId: params.listingId, body });
        setActiveConversation(result.conversation);
        setActiveId(result.conversation._id);
        router.replace({ pathname: '/(tabs)/messages', params: { conversationId: result.conversation._id } });
        setMessages([result.message]);
        setConversations((current) => [result.conversation, ...current.filter((item) => item._id !== result.conversation._id)]);
      }
      setDraft('');
    } catch (cause) {
      setError(messageFromError(cause));
    } finally {
      setSending(false);
    }
  }

  const isThreadOpen = Boolean(activeId || params.listingId);
  const headingName = activeConversation
    ? activeConversation.otherParticipant.name
    : params.farmerName || 'Farmer';

  return (
    <Screen>
      <BrandHeader locationLabel="Messages" />
      {!user ? (
        <View style={styles.gate}>
          <View style={styles.emptyIcon}><MessageCircle size={21} color={colors.forest} /></View>
          <Text style={styles.title}>Your market conversations</Text>
          <Text style={styles.copy}>Sign in to contact farmers, discuss harvests, and keep your listing conversations together.</Text>
          <ActionButton title="Sign in to view messages" onPress={() => router.push('/login')} />
        </View>
      ) : isThreadOpen ? (
        <View style={styles.threadPanel}>
          <View style={styles.threadHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back to inbox" onPress={showInbox} style={styles.backButton}>
              <ArrowLeft size={18} color={colors.forest} />
            </Pressable>
            <View style={styles.threadHeading}>
              <Text style={styles.title}>{headingName}</Text>
              <Text style={styles.copy}>{activeConversation?.listing.crop || params.listingCrop || 'FarmMarket listing'}</Text>
            </View>
          </View>
          {threadLoading ? (
            <View style={styles.loading}><ActivityIndicator color={colors.forest} /></View>
          ) : (
            <ScrollView style={styles.messageList} contentContainerStyle={styles.messageListContent} keyboardShouldPersistTaps="handled">
              {messages.length ? messages.map((message) => {
                const senderId = typeof message.sender === 'string' ? message.sender : message.sender._id;
                const ownMessage = senderId === user.id;
                return (
                  <View key={message._id} style={[styles.messageRow, ownMessage && styles.ownMessageRow]}>
                    <View style={[styles.bubble, ownMessage ? styles.ownBubble : styles.theirBubble]}>
                      <Text style={[styles.messageBody, ownMessage && styles.ownMessageBody]}>{message.body}</Text>
                      <Text style={[styles.messageTime, ownMessage && styles.ownMessageTime]}>{formatTime(message.createdAt)}</Text>
                    </View>
                  </View>
                );
              }) : (
                <View style={styles.threadEmpty}>
                  <MessageCircle size={22} color={colors.forest} />
                  <Text style={styles.copy}>Send a message to ask about this harvest.</Text>
                </View>
              )}
            </ScrollView>
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.composer}>
            <TextInput
              accessibilityLabel="Write a message"
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a message..."
              placeholderTextColor={colors.muted}
              multiline
              maxLength={2000}
              editable={!sending && !threadLoading}
              onSubmitEditing={() => { void send(); }}
              style={styles.composerInput}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              disabled={!draft.trim() || sending || threadLoading}
              onPress={() => { void send(); }}
              style={[styles.sendButton, (!draft.trim() || sending || threadLoading) && styles.sendDisabled]}>
              {sending ? <ActivityIndicator size="small" color={colors.primaryText} /> : <SendHorizontal size={18} color={colors.primaryText} />}
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.inbox}>
          <View style={styles.inboxHeading}>
            <View>
              <Text style={styles.eyebrow}>DIRECT FARM CONNECTIONS</Text>
              <Text style={styles.title}>Messages</Text>
              <Text style={styles.copy}>Talk with farmers and buyers about listed harvests.</Text>
            </View>
            <Inbox size={21} color={colors.forest} />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {inboxLoading ? <View style={styles.loading}><ActivityIndicator color={colors.forest} /></View> : conversations.length ? (
            <View style={styles.conversationList}>
              {conversations.map((conversation) => (
                <Pressable key={conversation._id} accessibilityRole="button" onPress={() => openConversation(conversation)} style={({ pressed }) => [styles.conversation, pressed && styles.pressed]}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{initials(conversation.otherParticipant.name)}</Text></View>
                  <View style={styles.conversationCopy}>
                    <View style={styles.conversationTitleRow}>
                      <Text style={styles.conversationName} numberOfLines={1}>{conversation.otherParticipant.name}</Text>
                      <Text style={styles.time}>{formatTime(conversation.lastMessageAt)}</Text>
                    </View>
                    <Text style={styles.listingName} numberOfLines={1}>{conversation.listing.crop}</Text>
                    <Text style={styles.preview} numberOfLines={1}>{conversation.lastMessage || 'Conversation started'}</Text>
                  </View>
                  {conversation.unreadCount > 0 ? <View style={styles.unread}><Text style={styles.unreadText}>{conversation.unreadCount}</Text></View> : null}
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}><MessageCircle size={21} color={colors.forest} /></View>
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.copy}>Open the market and choose “Message farmer” on a harvest listing to start a conversation.</Text>
              <ActionButton title="Explore the market" onPress={() => router.push('/(tabs)/market')} variant="secondary" />
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function messageFromError(error: unknown) {
  return error instanceof ApiError ? error.message : 'Could not load messages. Please try again.';
}

function createStyles(colors: MarketPalette) {
  return StyleSheet.create({
    gate: { maxWidth: 620, padding: 22, gap: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
    inbox: { width: '100%', maxWidth: 820, alignSelf: 'center', gap: 18 },
    inboxHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    eyebrow: { color: colors.leaf, fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 1.5 },
    title: { color: colors.ink, fontFamily: FontFamily.display, fontSize: 24, lineHeight: 30 },
    copy: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 12, lineHeight: 18 },
    conversationList: { borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.surface, overflow: 'hidden' },
    conversation: { minHeight: 84, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: colors.line },
    avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paleGreen },
    avatarText: { color: colors.forest, fontFamily: FontFamily.bold, fontSize: 12 },
    conversationCopy: { flex: 1, minWidth: 0, gap: 2 },
    conversationTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    conversationName: { flex: 1, color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 13 },
    listingName: { color: colors.forest, fontFamily: FontFamily.semibold, fontSize: 11 },
    preview: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 11 },
    time: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 10 },
    unread: { minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
    unreadText: { color: colors.primaryText, fontFamily: FontFamily.bold, fontSize: 10 },
    emptyState: { padding: 22, alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.surface },
    emptyTitle: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 15 },
    emptyIcon: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paleGreen },
    threadPanel: { width: '100%', maxWidth: 820, minHeight: 430, maxHeight: 660, alignSelf: 'center', padding: 14, gap: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.surface },
    threadHeader: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 10 },
    backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    threadHeading: { flex: 1, gap: 1 },
    messageList: { flex: 1, minHeight: 240 },
    messageListContent: { gap: 10, paddingVertical: 8 },
    messageRow: { flexDirection: 'row', justifyContent: 'flex-start' },
    ownMessageRow: { justifyContent: 'flex-end' },
    bubble: { maxWidth: '82%', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, gap: 4 },
    ownBubble: { backgroundColor: colors.primary },
    theirBubble: { backgroundColor: colors.paleGreen },
    messageBody: { color: colors.ink, fontFamily: FontFamily.body, fontSize: 13, lineHeight: 19 },
    ownMessageBody: { color: colors.primaryText },
    messageTime: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 9, alignSelf: 'flex-end' },
    ownMessageTime: { color: '#DCE8DE' },
    threadEmpty: { flex: 1, minHeight: 200, alignItems: 'center', justifyContent: 'center', gap: 9 },
    composer: { minHeight: 50, flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 7, borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.canvas },
    composerInput: { flex: 1, maxHeight: 100, minHeight: 36, paddingHorizontal: 8, paddingVertical: 8, color: colors.ink, fontFamily: FontFamily.body, fontSize: 13, outlineStyle: 'none' } as never,
    sendButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: colors.primary },
    sendDisabled: { opacity: 0.5 },
    loading: { minHeight: 150, alignItems: 'center', justifyContent: 'center' },
    error: { color: colors.danger, fontFamily: FontFamily.medium, fontSize: 12 },
    pressed: { opacity: 0.75 },
  });
}