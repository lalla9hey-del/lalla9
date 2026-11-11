import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const PERIODS = [
  { key: "beforeSchool", title: "등교 전", description: "아침에 확인할 일정" },
  { key: "afterSchool", title: "등교 후", description: "학교가 끝난 뒤 일정" },
];

export default function App() {
  const [schedules, setSchedules] = useState({
    beforeSchool: [],
    afterSchool: [],
  });

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "long",
      }).format(new Date()),
    [],
  );

  const allItems = Object.values(schedules).flat();
  const completedCount = allItems.filter((item) => item.completed).length;
  const progress = allItems.length ? completedCount / allItems.length : 0;

  function addSchedule(periodKey) {
    const newItem = {
      id: `${Date.now()}-${Math.random()}`,
      title: "",
      time: "",
      completed: false,
    };

    setSchedules((current) => ({
      ...current,
      [periodKey]: [...current[periodKey], newItem],
    }));
  }

  function updateSchedule(periodKey, itemId, changes) {
    setSchedules((current) => ({
      ...current,
      [periodKey]: current[periodKey].map((item) =>
        item.id === itemId ? { ...item, ...changes } : item,
      ),
    }));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.page}>
          <View style={styles.header}>
            <View>
              <Text style={styles.date}>{dateLabel}</Text>
              <Text style={styles.title}>오늘의 일정</Text>
              <Text style={styles.subtitle}>
                시간을 확인하고, 마친 일은 체크해요.
              </Text>
            </View>
            <View style={styles.dayBadge}>
              <Text style={styles.dayBadgeText}>MY DAY</Text>
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeading}>
              <Text style={styles.progressTitle}>오늘의 진행</Text>
              <Text style={styles.progressCount}>
                {completedCount}/{allItems.length} 완료
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(progress * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressHint}>
              {allItems.length === 0
                ? "오늘 할 일을 하나씩 추가해 보세요."
                : completedCount === allItems.length
                  ? "오늘 일정을 모두 마쳤어요!"
                  : "차근차근 하나씩 해봐요."}
            </Text>
          </View>

          {PERIODS.map((period) => {
            const items = schedules[period.key];
            return (
              <View key={period.key} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <View
                      style={[
                        styles.sectionDot,
                        period.key === "beforeSchool"
                          ? styles.morningDot
                          : styles.afternoonDot,
                      ]}
                    />
                    <Text style={styles.sectionTitle}>{period.title}</Text>
                    <Text style={styles.sectionCount}>{items.length}</Text>
                  </View>
                  <Text style={styles.sectionDescription}>
                    {period.description}
                  </Text>
                </View>

                {items.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>아직 일정이 없어요</Text>
                    <Text style={styles.emptyText}>
                      일정과 시간을 직접 적어 주세요.
                    </Text>
                  </View>
                ) : (
                  items.map((item) => (
                    <View key={item.id} style={styles.taskCard}>
                      <View style={styles.taskInputs}>
                        <TextInput
                          accessibilityLabel={`${period.title} 일정 이름`}
                          value={item.title}
                          onChangeText={(title) =>
                            updateSchedule(period.key, item.id, { title })
                          }
                          placeholder="일정 이름"
                          placeholderTextColor={COLORS.muted}
                          style={[
                            styles.nameInput,
                            item.completed && styles.completedName,
                          ]}
                          returnKeyType="done"
                        />
                        <View style={styles.timeRow}>
                          <Text style={styles.clockIcon}>◷</Text>
                          <TextInput
                            accessibilityLabel={`${period.title} 알람 시간`}
                            value={item.time}
                            onChangeText={(time) =>
                              updateSchedule(period.key, item.id, { time })
                            }
                            placeholder="알람 시간 (시:분)"
                            placeholderTextColor={COLORS.muted}
                            keyboardType="numbers-and-punctuation"
                            maxLength={5}
                            style={styles.timeInput}
                          />
                        </View>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          item.completed ? "완료 표시 해제" : "완료 표시"
                        }
                        accessibilityState={{ checked: item.completed }}
                        onPress={() =>
                          updateSchedule(period.key, item.id, {
                            completed: !item.completed,
                          })
                        }
                        style={[
                          styles.checkButton,
                          item.completed && styles.checkButtonDone,
                        ]}
                      >
                        <Text
                          style={[
                            styles.checkMark,
                            item.completed && styles.checkMarkDone,
                          ]}
                        >
                          {item.completed ? "✓" : ""}
                        </Text>
                      </Pressable>
                    </View>
                  ))
                )}

                <Pressable
                  accessibilityRole="button"
                  onPress={() => addSchedule(period.key)}
                  style={styles.addButton}
                >
                  <Text style={styles.addButtonPlus}>＋</Text>
                  <Text style={styles.addButtonText}>일정 추가</Text>
                </Pressable>
              </View>
            );
          })}

          <View style={styles.notice}>
            <Text style={styles.noticeIcon}>🔔</Text>
            <Text style={styles.noticeText}>
              지금은 일정 작성과 완료 체크 초안이에요. 지정한 시간에 실제로
              알림을 보내는 기능은 다음 단계에서 연결할게요.
            </Text>
          </View>
          <Text style={styles.footer}>하루 한 걸음, 잘하고 있어요.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const COLORS = {
  background: "#F5F7FC",
  ink: "#1D2C4D",
  muted: "#7E8AA3",
  line: "#E7EBF3",
  blue: "#4D6BCE",
  paleBlue: "#E9EEFF",
  orange: "#F0A34A",
  paleOrange: "#FFF1DF",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  page: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    gap: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 8,
    paddingBottom: 4,
  },
  date: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  title: {
    color: COLORS.ink,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 7,
  },
  dayBadge: {
    backgroundColor: COLORS.paleBlue,
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginTop: 4,
  },
  dayBadgeText: {
    color: COLORS.blue,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  progressCard: {
    backgroundColor: COLORS.ink,
    borderRadius: 22,
    padding: 20,
    gap: 13,
  },
  progressHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  progressCount: {
    color: "#D5DEFF",
    fontSize: 13,
    fontWeight: "700",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#465574",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#A9C2FF",
    borderRadius: 8,
  },
  progressHint: {
    color: "#D5DEFF",
    fontSize: 13,
  },
  section: {
    gap: 11,
  },
  sectionHeader: {
    paddingHorizontal: 2,
    gap: 4,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  morningDot: {
    backgroundColor: COLORS.orange,
  },
  afternoonDot: {
    backgroundColor: COLORS.blue,
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 19,
    fontWeight: "800",
  },
  sectionCount: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 2,
  },
  sectionDescription: {
    color: COLORS.muted,
    fontSize: 12,
    marginLeft: 18,
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 22,
    gap: 6,
  },
  emptyTitle: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  taskInputs: {
    flex: 1,
    gap: 8,
  },
  nameInput: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: "700",
    paddingVertical: 3,
  },
  completedName: {
    color: COLORS.muted,
    textDecorationLine: "line-through",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  clockIcon: {
    color: COLORS.blue,
    fontSize: 18,
  },
  timeInput: {
    color: COLORS.muted,
    flex: 1,
    fontSize: 12,
    paddingVertical: 2,
  },
  checkButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderColor: "#C8D1E3",
    borderRadius: 17,
    borderWidth: 2,
  },
  checkButtonDone: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  checkMark: {
    color: "transparent",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 22,
  },
  checkMarkDone: {
    color: COLORS.white,
  },
  addButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 4,
    paddingVertical: 7,
  },
  addButtonPlus: {
    color: COLORS.blue,
    fontSize: 19,
    fontWeight: "600",
  },
  addButtonText: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: "700",
  },
  notice: {
    alignItems: "flex-start",
    backgroundColor: COLORS.paleOrange,
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
    padding: 14,
  },
  noticeIcon: {
    fontSize: 16,
  },
  noticeText: {
    color: "#795729",
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 4,
  },
});
