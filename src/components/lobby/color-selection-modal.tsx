"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Zap, Star } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { getLobbyUserFacingError } from "@/lib/convex-error";

const COLORS = ["red", "blue", "white", "orange"] as const;
const TIMER_SECONDS = 30;

interface ColorSelectionModalProps {
  open: boolean;
  lobbyId: string;
  lobbyPlayers: any[];
}

export function ColorSelectionModal({
  open,
  lobbyId,
  lobbyPlayers,
}: ColorSelectionModalProps) {
  const { user } = useUser();
  const selectPlayerColor = useMutation(api.lobbies.api.selectPlayerColor);
  const finalizeColorsAndStartGame = useMutation(
    api.lobbies.api.finalizeColorsAndStartGame,
  );

  const progress = useMotionValue(TIMER_SECONDS);
  const progressPercent = useTransform(progress, [TIMER_SECONDS, 0], [100, 0]);
  const timeLeft = useTransform(
    progress,
    [TIMER_SECONDS, 0],
    [TIMER_SECONDS, 0],
  );

  const [selectedColors, setSelectedColors] = useState<Record<string, string>>(
    {},
  );
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timeLeftDisplay, setTimeLeftDisplay] = useState(TIMER_SECONDS);
  const [animatingColors, setAnimatingColors] = useState<Set<string>>(
    new Set(),
  );
  const [sparkles, setSparkles] = useState<
    { id: number; x: number; y: number; color: string }[]
  >([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserPlayer = lobbyPlayers.find(
    (p) => !p.isAI && p.clerkId && user?.id && p.clerkId === user.id,
  );

  const isHost = currentUserPlayer?.isHost || false;

  const availableColors = COLORS.filter(
    (c) =>
      !Object.values(selectedColors).includes(c) &&
      currentUserPlayer?.color !== c,
  );

  // Start timer when modal opens
  useEffect(() => {
    if (open) {
      progress.set(TIMER_SECONDS);
      const controls = animate(progress, 0, {
        duration: TIMER_SECONDS,
        ease: "linear",
      });
      controls.then(() => {
        handleTimerEnd();
      });
      return () => controls.stop();
    }
  }, [open]);

  // Update timer display every second (for text only, slider uses smooth motion value)
  useEffect(() => {
    if (open && !isFinalizing) {
      const timerInterval = setInterval(() => {
        const currentTime = Math.ceil(timeLeft.get());
        setTimeLeftDisplay(currentTime);
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [open, isFinalizing, timeLeft]);

  // Track selected colors from lobbyPlayers
  useEffect(() => {
    const map: Record<string, string> = {};
    lobbyPlayers.forEach((p) => {
      if (p.color && p.color !== "unassigned") {
        map[p._id] = p.color;
      }
    });
    setSelectedColors(map);
  }, [lobbyPlayers]);

  // Check if all players have selected colors
  const allSelected = lobbyPlayers.every(
    (p) => p.color && p.color !== "unassigned",
  );

  // Auto-finalize when all selected with delay and fadeout
  useEffect(() => {
    if (allSelected && open && !isFinalizing) {
      // Start fadeout after 4 seconds
      const fadeoutTimer = setTimeout(() => {
        setIsFinalizing(true);
        // Handle timer end after fadeout starts
        setTimeout(() => {
          handleTimerEnd();
        }, 1000); // Give time for fadeout animation
      }, 4000);

      return () => clearTimeout(fadeoutTimer);
    }
  }, [allSelected, open, isFinalizing]);

  const handleSelectColor = async (color: (typeof COLORS)[number]) => {
    if (!user?.id || !lobbyId || !currentUserPlayer) return;

    // Add animation
    setAnimatingColors((prev) => new Set(prev).add(color));

    // Create sparkles effect
    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color,
    }));
    setSparkles((prev) => [...prev, ...newSparkles]);

    // Remove sparkles after animation
    setTimeout(() => {
      setSparkles((prev) =>
        prev.filter((s) => !newSparkles.find((ns) => ns.id === s.id)),
      );
    }, 1000);

    try {
      await selectPlayerColor({
        clerkId: user.id,
        lobbyId: lobbyId as any,
        color,
      });
      toast.success("Color selected! 🎨");
    } catch (error) {
      toast.error(getLobbyUserFacingError(error));
    } finally {
      setTimeout(() => {
        setAnimatingColors((prev) => {
          const newSet = new Set(prev);
          newSet.delete(color);
          return newSet;
        });
      }, 500);
    }
  };

  const handleTimerEnd = async () => {
    if (isFinalizing) return;

    // Only the host can finalize colors and start the game
    if (!isHost) {
      return;
    }

    setIsFinalizing(true);

    try {
      await finalizeColorsAndStartGame({
        clerkId: user?.id || "",
        lobbyId: lobbyId as any,
      });
      toast.success("Game starting!");
    } catch (error) {
      toast.error(getLobbyUserFacingError(error));
      setIsFinalizing(false);
    }
  };

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="sm:max-w-4xl p-0 overflow-hidden"
        showCloseButton={false}
      >
        <AnimatePresence>
          {isFinalizing && (
            <motion.div
              className="absolute inset-0 bg-black/60 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        <motion.div
          animate={
            isFinalizing
              ? {
                  opacity: [1, 0],
                  scale: [1, 0.8],
                  transition: { duration: 1, ease: "easeInOut" },
                }
              : {}
          }
        >
          <VisuallyHidden>
            <DialogTitle>Choose Your Color</DialogTitle>
          </VisuallyHidden>
          <div className="relative p-8 space-y-8">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-20 h-20 bg-emerald-500/5 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Sparkles Container */}
            <AnimatePresence>
              {sparkles.map((sparkle) => (
                <motion.div
                  key={sparkle.id}
                  className="absolute pointer-events-none"
                  style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0] }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 1 }}
                >
                  <Sparkles
                    className={`w-6 h-6 ${
                      sparkle.color === "red"
                        ? "text-red-300"
                        : sparkle.color === "blue"
                          ? "text-blue-300"
                          : sparkle.color === "white"
                            ? "text-white"
                            : "text-orange-300"
                    }`}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Header */}
            <div className="relative text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="inline-block"
              >
                <div className="bg-primary rounded-xl px-6 py-3">
                  <h2 className="text-2xl font-bold text-primary-foreground flex items-center gap-3">
                    Choose Your Color!
                  </h2>
                </div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-emerald-100 text-lg font-medium"
              >
                Pick your unique color to dominate the island!
              </motion.p>
            </div>

            {/* Timer Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-emerald-100">
                <span>Time remaining</span>
                <motion.span>{timeLeftDisplay}s</motion.span>
              </div>
              <div className="h-3 bg-emerald-950/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                  style={{ width: `${progressPercent.get()}%` }}
                />
              </div>
            </div>

            {/* Color Selection Grid */}
            <div className="relative space-y-6">
              <div className="grid grid-cols-4 gap-6">
                {COLORS.map((color, index) => {
                  const playerWithColor = lobbyPlayers.find(
                    (p) => p.color === color && p.color !== "unassigned",
                  );
                  const isAnimating = animatingColors.has(color);

                  return (
                    <motion.div
                      key={color}
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      }}
                      className="space-y-3"
                    >
                      <motion.div
                        className="text-center text-lg font-bold text-emerald-100 capitalize"
                        animate={{
                          scale: isAnimating ? [1, 1.2, 1] : 1,
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: isAnimating ? Infinity : 0,
                          repeatType: "reverse",
                        }}
                      >
                        {color}
                      </motion.div>

                      <motion.button
                        whileHover={{
                          scale: playerWithColor ? 1 : 1.1,
                          rotate: playerWithColor ? 0 : [0, -5, 5, 0],
                        }}
                        whileTap={{ scale: playerWithColor ? 1 : 0.95 }}
                        onClick={() =>
                          !playerWithColor && handleSelectColor(color)
                        }
                        disabled={!!playerWithColor}
                        className={`relative h-36 w-36 rounded-2xl border-4 transition-all mx-auto shadow-2xl ${
                          color === "red"
                            ? "bg-gradient-to-br from-red-400 to-red-600 border-red-300 hover:from-red-500 hover:to-red-700"
                            : color === "blue"
                              ? "bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300 hover:from-blue-500 hover:to-blue-700"
                              : color === "white"
                                ? "bg-gradient-to-br from-gray-100 to-gray-300 border-gray-200 hover:from-gray-200 hover:to-gray-400"
                                : "bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300 hover:from-orange-500 hover:to-orange-700"
                        } ${
                          playerWithColor
                            ? "cursor-not-allowed opacity-80"
                            : "cursor-pointer hover:shadow-3xl"
                        } ${isAnimating ? "animate-pulse" : ""}`}
                      >
                        {/* Glow effect for available colors */}
                        {!playerWithColor && (
                          <motion.div
                            className="absolute inset-0 rounded-2xl bg-emerald-400/10"
                            animate={{
                              opacity: [0, 0.2, 0],
                              scale: [0.95, 1.05, 0.95],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        )}

                        {playerWithColor ? (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-2"
                          >
                            <motion.img
                              src={
                                playerWithColor.imageUrl ||
                                "/default-avatar.png"
                              }
                              alt={playerWithColor.displayName}
                              className="w-16 h-16 rounded-full border-3 border-white shadow-lg"
                              onError={(e) => {
                                e.currentTarget.src = "/default-avatar.png";
                              }}
                              animate={{
                                rotate: [0, 360],
                              }}
                              transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                            <motion.div
                              className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-center text-gray-800"
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              {playerWithColor.displayName.length > 10
                                ? playerWithColor.displayName.substring(0, 10) +
                                  "..."
                                : playerWithColor.displayName}
                            </motion.div>
                          </motion.div>
                        ) : (
                          <motion.div
                            className="absolute inset-0 flex flex-col items-center justify-center p-2"
                            whileHover={{ scale: 1.1 }}
                          >
                            <motion.div
                              className="text-white font-bold text-lg capitalize drop-shadow-lg text-center"
                              animate={{
                                y: isAnimating ? [-5, 5, -5] : 0,
                              }}
                              transition={{
                                duration: 0.5,
                                repeat: isAnimating ? 3 : 0,
                                ease: "easeInOut",
                              }}
                            >
                              Click Me!
                            </motion.div>
                            <motion.div
                              className="text-white/80 text-sm text-center mt-1"
                              animate={{
                                opacity: [0.5, 1, 0.5],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            >
                              ✨
                            </motion.div>
                          </motion.div>
                        )}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative text-center"
            >
              <div className="bg-emerald-500/20 backdrop-blur-sm rounded-2xl px-6 py-4 border-2 border-emerald-400/30">
                <div className="flex items-center justify-center gap-3 text-emerald-100">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span className="text-lg font-bold">
                    {allSelected
                      ? "All settlers ready! Journey begins soon..."
                      : `Waiting for ${lobbyPlayers.filter((p) => !p.color || p.color === "unassigned").length} settlers to choose...`}
                  </span>
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
