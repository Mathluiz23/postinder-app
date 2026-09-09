import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { WebView } from "react-native-webview";
import { Post, PostFile } from "../types";
import { colors } from "../theme/colors";

const { width } = Dimensions.get("window");

function VideoPlayerView({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return (
    <VideoView player={player} style={styles.media} nativeControls contentFit="contain" />
  );
}

function AudioPlayer({ uri }: { uri: string }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  function toggle() {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }

  return (
    <View style={styles.audioBox}>
      <TouchableOpacity style={styles.audioButton} onPress={toggle}>
        <Text style={styles.audioButtonText}>
          {status.playing ? "⏸ Pausar" : "▶ Reproduzir áudio"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function MediaContent({ file, mediaUrl }: { file: PostFile; mediaUrl: string | null }) {
  if (!mediaUrl) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Arquivo indisponível</Text>
      </View>
    );
  }

  switch (file.file_type) {
    case "image":
      return <Image source={{ uri: mediaUrl }} style={styles.media} resizeMode="cover" />;

    case "video":
      return <VideoPlayerView uri={mediaUrl} />;

    case "audio":
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{file.name}</Text>
          <AudioPlayer uri={mediaUrl} />
        </View>
      );

    case "pdf":
      if (Platform.OS === "android") {
        return (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{file.name}</Text>
            <TouchableOpacity
              style={styles.audioButton}
              onPress={() => Linking.openURL(mediaUrl)}
            >
              <Text style={styles.audioButtonText}>Abrir PDF</Text>
            </TouchableOpacity>
          </View>
        );
      }
      return <WebView source={{ uri: mediaUrl }} style={styles.media} />;

    default:
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{file.name}</Text>
          <TouchableOpacity style={styles.audioButton} onPress={() => Linking.openURL(mediaUrl)}>
            <Text style={styles.audioButtonText}>Abrir arquivo</Text>
          </TouchableOpacity>
        </View>
      );
  }
}

export default function PostMediaViewer({ post }: { post: Post }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const file = post.files[activeIndex];

  if (!file) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Sem mídia neste post</Text>
      </View>
    );
  }

  const mediaUrl = file.url ?? file.storage_url;

  return (
    <View>
      <View style={styles.mediaBox}>
        <MediaContent key={file.id} file={file} mediaUrl={mediaUrl} />
      </View>

      {post.files.length > 1 && (
        <ScrollView horizontal style={styles.thumbRow} showsHorizontalScrollIndicator={false}>
          {post.files.map((f, i) => (
            <View
              key={f.id}
              style={[styles.thumb, i === activeIndex && styles.thumbActive]}
              onTouchEnd={() => setActiveIndex(i)}
            >
              <Text style={[styles.thumbLabel, i === activeIndex && styles.thumbLabelActive]}>
                {i + 1}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mediaBox: {
    width: width - 32,
    height: width - 32,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.secondaryTint,
  },
  media: { width: "100%", height: "100%" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  placeholderText: { color: colors.textMuted },
  audioBox: { alignItems: "center" },
  audioButton: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  audioButtonText: { color: "#fff", fontWeight: "600" },
  thumbRow: { marginTop: 10 },
  thumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  thumbActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  thumbLabel: { color: colors.textMuted, fontSize: 12 },
  thumbLabelActive: { color: "#fff" },
});
