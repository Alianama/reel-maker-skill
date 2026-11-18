import { Tes } from "./Tes";
import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { Reel, ReelProps } from "./Reel";
import { ReelData } from "./theme";
import { Talk, TalkData, TalkProps } from "./Talk";
import { Poster, PosterProps } from "./Poster";
import { Banner } from "./Banner";

const FPS = 30;

// data.json is written by scripts/make.mjs (script + voiceover durations).
const calculateMetadata: CalculateMetadataFunction<ReelProps> = async ({ props }) => {
  const data: ReelData = await fetch(staticFile(`reels/${props.slug}/data.json`)).then((r) => r.json());
  const frames = data.scenes.reduce((a, s) => a + Math.ceil(s.duration * FPS), 0);
  return { durationInFrames: frames, props: { ...props, data } };
};

// data.json is written by scripts/talk.mjs (cut segments, words and events in output frames).
const talkMetadata: CalculateMetadataFunction<TalkProps> = async ({ props }) => {
  const data: TalkData = await fetch(staticFile(`talks/${props.slug}/data.json`)).then((r) => r.json());
  const last = data.segments[data.segments.length - 1];
  return { durationInFrames: last.start + last.len, props: { ...props, data } };
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Reel"
      component={Reel}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={300}
      defaultProps={{ slug: "kenapa-ai-2026" } as ReelProps}
      calculateMetadata={calculateMetadata}
    />
    <Composition
      id="Talk"
      component={Talk}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={300}
      defaultProps={{ slug: "contoh/tes" } as TalkProps}
      calculateMetadata={talkMetadata}
    />
    <Composition
      id="Poster"
      component={Poster}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={1}
      defaultProps={{ days: 29 } as PosterProps}
    />
    <Composition id="Banner" component={Banner} fps={FPS} width={2560} height={1440} durationInFrames={1} />
    <Composition
      id="tes"
      component={Tes}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
