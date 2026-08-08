import { TextToSpeechView } from "@/features/text-to-speech/views/text-to-speech-view";
import type { Metadata } from "next";
import { trpc, HydrateClient, prefetch } from "@/trpc/server";

export const metadata: Metadata = { title: "Text to Speech" };

export default async function TextToSpeechPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const text = typeof params.text === "string" ? params.text : undefined;

  const voiceIdKey = Object.keys(params).find(
    (k) => k.toLowerCase() === "voiceid" || k.toLowerCase() === "voice_id"
  );
  const voiceId =
    voiceIdKey && typeof params[voiceIdKey] === "string"
      ? (params[voiceIdKey] as string)
      : undefined;

  prefetch(trpc.voices.getAll.queryOptions());

  return (
    <HydrateClient>
      <TextToSpeechView initialValues={{ text, voiceId }} />
    </HydrateClient>
  );
};