import type { EventType, Language, RecordStatus } from "./types";

export const DUMMY_EMAIL_DOMAIN = "usatora.local";

export const events: Record<
  EventType,
  {
    ja: string;
    en: string;
    unitJa: string;
    unitEn: string;
    unit: string;
  }
> = {
  push_ups: {
    ja: "腕立て伏せ",
    en: "Push-ups",
    unitJa: "回",
    unitEn: "reps",
    unit: "reps"
  },
  grip_strength: {
    ja: "握力",
    en: "Grip Strength",
    unitJa: "kg",
    unitEn: "kg",
    unit: "kg"
  },
  sit_ups: {
    ja: "腹筋",
    en: "Sit-ups",
    unitJa: "回",
    unitEn: "reps",
    unit: "reps"
  },
  sit_and_reach: {
    ja: "長座体前屈",
    en: "Sit and Reach",
    unitJa: "cm",
    unitEn: "cm",
    unit: "cm"
  },
  dead_hang: {
    ja: "ぶらさがり",
    en: "Dead Hang",
    unitJa: "秒",
    unitEn: "sec",
    unit: "sec"
  }
};

export const eventOrder = Object.keys(events) as EventType[];

export const statusLabels: Record<RecordStatus, Record<Language, string>> = {
  normal: { ja: "通常記録", en: "Saved" },
  pending: { ja: "承認待ち", en: "Pending" },
  approved: { ja: "承認済み", en: "Approved" },
  rejected: { ja: "否認", en: "Rejected" }
};

export const t = {
  appName: { ja: "うさとらコンペ", en: "U&T COMPETITION" },
  appSubtitle: {
    ja: "U&T Fitness 体力測定ランキング",
    en: "U&T Fitness Performance Rankings"
  },
  login: { ja: "ログイン", en: "Log in" },
  register: { ja: "会員登録", en: "Register" },
  logout: { ja: "ログアウト", en: "Log out" },
  instagramName: { ja: "名前", en: "Name" },
  password: { ja: "パスワード", en: "Password" },
  dashboard: { ja: "ホーム", en: "Home" },
  records: { ja: "記録", en: "Records" },
  body: { ja: "身体", en: "Body" },
  charts: { ja: "グラフ", en: "Charts" },
  rankings: { ja: "ランキング", en: "Rankings" },
  profile: { ja: "プロフィール", en: "Profile" },
  admin: { ja: "管理", en: "Admin" },
  latestFitness: { ja: "最新の体力テスト", en: "Latest fitness result" },
  latestBody: { ja: "最新の身体データ", en: "Latest body data" },
  announcements: { ja: "お知らせ", en: "Announcements" },
  followInstagram: {
    ja: "U&T FitnessをInstagramでフォロー",
    en: "Follow U&T Fitness on Instagram"
  },
  registerFollowRequired: {
    ja: "会員登録には、U&T FitnessのInstagramフォローが必要です。",
    en: "Following U&T Fitness on Instagram is required to register."
  },
  registerFollowInstructions: {
    ja: "下のボタンからInstagramを開き、フォロー後にチェックを入れてください。",
    en: "Open Instagram from the button below, then check the box after following."
  },
  openInstagramFollow: {
    ja: "Instagramを開いてフォローする",
    en: "Open Instagram and Follow"
  },
  followConfirmed: {
    ja: "U&T FitnessのInstagramをフォローしました",
    en: "I have followed U&T Fitness on Instagram"
  },
  followConfirmError: {
    ja: "Instagramフォロー確認にチェックを入れてください。",
    en: "Please confirm that you followed U&T Fitness on Instagram."
  },
  backToHome: { ja: "ホームへ戻る", en: "Back to Home" },
  backToAdminHome: {
    ja: "管理者ホームへ戻る",
    en: "Back to Admin Home"
  },
  latestBodyShort: {
    ja: "最新の身体データ",
    en: "Latest body data"
  },
  newRecord: { ja: "体力テストを入力", en: "Add fitness result" },
  newBody: { ja: "身体データを入力", en: "Add body data" },
  viewCharts: { ja: "推移を見る", en: "View charts" },
  viewRankings: { ja: "ランキングを見る", en: "View rankings" },
  measuredAt: { ja: "測定日", en: "Measurement date" },
  eventType: { ja: "種目", en: "Event" },
  value: { ja: "記録数値", en: "Value" },
  comment: { ja: "コメント", en: "Comment" },
  save: { ja: "保存", en: "Save" },
  height: { ja: "身長 cm", en: "Height cm" },
  weight: { ja: "体重 kg", en: "Weight kg" },
  bodyFat: { ja: "体脂肪率 %", en: "Body fat %" },
  empty: { ja: "まだデータがありません。", en: "No data yet." },
  language: { ja: "言語", en: "Language" },
  japanese: { ja: "日本語", en: "Japanese" },
  english: { ja: "英語", en: "English" },
  pendingApprovals: { ja: "承認待ち", en: "Pending approvals" },
  members: { ja: "会員", en: "Members" },
  thisMonthRecords: { ja: "今月の記録", en: "Records this month" },
  approve: { ja: "承認", en: "Approve" },
  reject: { ja: "否認", en: "Reject" },
  title: { ja: "タイトル", en: "Title" },
  bodyText: { ja: "本文", en: "Body" },
  publish: { ja: "公開", en: "Published" },
  unpublish: { ja: "非公開", en: "Hidden" },
  create: { ja: "作成", en: "Create" },
  delete: { ja: "削除", en: "Delete" },
  topThreeOnly: {
    ja: "ランキングは承認済みの上位3件のみ表示されます。",
    en: "Rankings show only approved top 3 results."
  }
} as const;
