import SwiftUI
import WidgetKit

private let wallCalAppGroupID = "group.org.reactjs.native.example.WallCalNative.shared"
private let wallCalEventsKey = "wallcal_widget_events"

struct WallCalWidgetEvent: Codable, Identifiable {
  let id: String
  let title: String
  let person: String
  let category: String
  let date: String
  let notifyDays: Int
  let theme: String
  let storeName: String?
  let storeId: String?
  let returnDeadline: Bool?
}

struct WallCalWidgetPayload: Codable {
  let syncedAt: String
  let events: [WallCalWidgetEvent]
}

struct WallCalEntry: TimelineEntry {
  let date: Date
  let event: WallCalWidgetEvent?
  let daysRemaining: Int?
  let nextOccurrence: Date?
  let upcomingCount: Int
}

struct WallCalProvider: TimelineProvider {
  func placeholder(in context: Context) -> WallCalEntry {
    WallCalEntry(
      date: Date(),
      event: WallCalWidgetEvent(
        id: "placeholder",
        title: "Doctor appointment",
        person: "Sarah",
        category: "appointment",
        date: "2026-05-20",
        notifyDays: 1,
        theme: "ocean",
        storeName: nil,
        storeId: nil,
        returnDeadline: nil
      ),
      daysRemaining: 2,
      nextOccurrence: Calendar.current.date(byAdding: .day, value: 2, to: Date()),
      upcomingCount: 3
    )
  }

  func getSnapshot(in context: Context, completion: @escaping (WallCalEntry) -> Void) {
    completion(makeEntries().first ?? makeEmptyEntry())
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<WallCalEntry>) -> Void) {
    let entries = makeEntries()
    let midnight = Calendar.current.nextDate(
      after: Date(),
      matching: DateComponents(hour: 0, minute: 0),
      matchingPolicy: .nextTime
    ) ?? Date().addingTimeInterval(86400)
    completion(Timeline(entries: entries, policy: .after(midnight)))
  }

  private func makeEmptyEntry() -> WallCalEntry {
    WallCalEntry(date: Date(), event: nil, daysRemaining: nil, nextOccurrence: nil, upcomingCount: 0)
  }

  private func makeEntries() -> [WallCalEntry] {
    let events = loadEvents()
    let datedEvents = events.compactMap { event -> (WallCalWidgetEvent, Int, Date)? in
      guard let (days, date) = computeNextOccurrence(event: event) else { return nil }
      return (event, days, date)
    }.sorted { lhs, rhs in
      lhs.1 == rhs.1 ? lhs.0.title < rhs.0.title : lhs.1 < rhs.1
    }

    let now = Date()
    let totalCount = datedEvents.count

    if datedEvents.isEmpty {
      return [makeEmptyEntry()]
    }

    return datedEvents.prefix(5).enumerated().map { index, triple in
      let entryDate = Calendar.current.date(byAdding: .minute, value: index * 30, to: now) ?? now
      return WallCalEntry(
        date: entryDate,
        event: triple.0,
        daysRemaining: triple.1,
        nextOccurrence: triple.2,
        upcomingCount: totalCount
      )
    }
  }

  private func loadEvents() -> [WallCalWidgetEvent] {
    guard
      let defaults = UserDefaults(suiteName: wallCalAppGroupID),
      let payload = defaults.string(forKey: wallCalEventsKey),
      let data = payload.data(using: .utf8),
      let decoded = try? JSONDecoder().decode(WallCalWidgetPayload.self, from: data)
    else {
      return []
    }
    return decoded.events
  }

  private func computeNextOccurrence(event: WallCalWidgetEvent) -> (Int, Date)? {
    let formatter = DateFormatter()
    formatter.calendar = Calendar(identifier: .gregorian)
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "yyyy-MM-dd"

    guard let sourceDate = formatter.date(from: event.date) else { return nil }

    let calendar = Calendar.current
    let now = calendar.startOfDay(for: Date())
    var target = calendar.startOfDay(for: sourceDate)

    if event.category == "birthday" || event.category == "anniversary" {
      let month = calendar.component(.month, from: sourceDate)
      let day = calendar.component(.day, from: sourceDate)
      target = calendar.date(from: DateComponents(
        year: calendar.component(.year, from: now), month: month, day: day
      )) ?? target
      if target < now {
        target = calendar.date(byAdding: .year, value: 1, to: target) ?? target
      }
    } else if event.category == "payment" || event.category == "loan" {
      let day = calendar.component(.day, from: sourceDate)
      let nowYear = calendar.component(.year, from: now)
      let nowMonth = calendar.component(.month, from: now)
      target = calendar.date(from: DateComponents(year: nowYear, month: nowMonth, day: day)) ?? target
      if target < now {
        target = calendar.date(byAdding: .month, value: 1, to: target) ?? target
      }
    }

    guard let days = calendar.dateComponents([.day], from: now, to: target).day else { return nil }
    return (days, target)
  }
}

// MARK: - Lock Screen Views

struct WallCalRectangularView: View {
  let entry: WallCalEntry

  var body: some View {
    if let event = entry.event {
      VStack(alignment: .leading, spacing: 6) {
        Text(categoryIcon(for: event.category) + " " + event.title)
          .font(.system(size: 14, weight: .bold))
          .lineLimit(1)
        if !event.person.isEmpty {
          Text(event.person)
            .font(.system(size: 12))
            .foregroundStyle(.secondary)
            .lineLimit(1)
        }
        Text(detailText)
          .font(.system(size: 13, weight: .semibold))
          .foregroundStyle(.tint)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    } else {
      Text("No upcoming reminders")
        .font(.system(size: 13, weight: .semibold))
    }
  }

  private var detailText: String {
    if let days = entry.daysRemaining {
      return days == 0 ? "Today" : "In \(days)d"
    }
    return "Upcoming reminders"
  }
}

struct WallCalCircularView: View {
  let entry: WallCalEntry

  var body: some View {
    ZStack {
      Circle().stroke(Color.purple.opacity(0.25), lineWidth: 8)
      VStack(spacing: 2) {
        Text(entry.event.map { categoryIcon(for: $0.category) } ?? "📌")
          .font(.system(size: 16))
        Text(entry.daysRemaining.map { $0 == 0 ? "0" : "\($0)" } ?? "–")
          .font(.system(size: 18, weight: .bold))
      }
    }
    .padding(6)
  }
}

struct WallCalInlineView: View {
  let entry: WallCalEntry

  var body: some View {
    if let event = entry.event {
      Text("\(categoryIcon(for: event.category)) \(event.title) \(inlineSuffix)")
    } else {
      Text("📌 No upcoming reminders")
    }
  }

  private var inlineSuffix: String {
    guard let days = entry.daysRemaining else { return "" }
    return days == 0 ? "today" : "in \(days)d"
  }
}

// MARK: - Home Screen Medium View

struct WallCalMediumView: View {
  let entry: WallCalEntry

  var body: some View {
    if let event = entry.event {
      ZStack {
        if let wallpaper = loadWallpaperImage() {
          Image(uiImage: wallpaper)
            .resizable()
            .scaledToFill()
            .overlay(
              LinearGradient(
                colors: [.black.opacity(0.15), .black.opacity(0.65)],
                startPoint: .top,
                endPoint: .bottom
              )
            )
        } else {
          LinearGradient(
            colors: [
              categoryColor(for: event.category).opacity(0.85),
              categoryColor(for: event.category).opacity(0.4)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
          )
        }

        HStack(spacing: 0) {
          VStack(spacing: 8) {
            Text(categoryIcon(for: event.category))
              .font(.system(size: 52))
            Text(event.category.uppercased())
              .font(.system(size: 9, weight: .bold))
              .foregroundStyle(.white.opacity(0.8))
              .tracking(1)
          }
          .frame(width: 100)

          Rectangle()
            .fill(.white.opacity(0.3))
            .frame(width: 1)
            .padding(.vertical, 12)

          VStack(alignment: .leading, spacing: 6) {
            HStack {
              if let days = entry.daysRemaining, days == 0 {
                Text("TODAY!")
                  .font(.system(size: 11, weight: .black))
                  .foregroundStyle(.red)
                  .padding(.horizontal, 8)
                  .padding(.vertical, 3)
                  .background(.white)
                  .clipShape(Capsule())
              } else if let days = entry.daysRemaining {
                Text("in \(days) day\(days == 1 ? "" : "s")")
                  .font(.system(size: 11, weight: .bold))
                  .foregroundStyle(.white)
                  .padding(.horizontal, 8)
                  .padding(.vertical, 3)
                  .background(.white.opacity(0.25))
                  .clipShape(Capsule())
              }
              Spacer()
              if entry.upcomingCount > 1 {
                Text("1 of \(entry.upcomingCount)")
                  .font(.system(size: 9))
                  .foregroundStyle(.white.opacity(0.6))
              }
            }

            Text(event.title)
              .font(.system(size: 17, weight: .bold))
              .foregroundStyle(.white)
              .lineLimit(2)
              .shadow(color: .black.opacity(0.5), radius: 4)

            if !event.person.isEmpty {
              Text(event.person)
                .font(.system(size: 12))
                .foregroundStyle(.white.opacity(0.75))
                .lineLimit(1)
            }

            Spacer()

            if let nextDate = entry.nextOccurrence {
              Text(nextDate, style: .date)
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(.white.opacity(0.9))
                .shadow(color: .black.opacity(0.5), radius: 2)
            }
          }
          .padding(.leading, 14)
          .padding(.vertical, 14)
          .padding(.trailing, 14)
        }
      }
      .clipped()
    } else {
      ZStack {
        Color(.systemGray6)
        VStack(spacing: 6) {
          Image(systemName: "checkmark.circle.fill")
            .font(.system(size: 32))
            .foregroundStyle(.green)
          Text("No upcoming events")
            .font(.system(size: 13))
            .foregroundStyle(.secondary)
        }
      }
    }
  }

  private func loadWallpaperImage() -> UIImage? {
    guard let url = FileManager.default
      .containerURL(forSecurityApplicationGroupIdentifier: wallCalAppGroupID)?
      .appendingPathComponent("wallcal_wallpaper.jpg")
    else { return nil }
    return UIImage(contentsOfFile: url.path)
  }
}

// MARK: - Helpers

struct WallCalWidgetBackground: ViewModifier {
  func body(content: Content) -> some View {
    if #available(iOSApplicationExtension 17.0, *) {
      content.containerBackground(.fill.tertiary, for: .widget)
    } else {
      content
        .padding(8)
        .background(Color(UIColor.secondarySystemBackground))
    }
  }
}

struct WallCalMediumBackground: ViewModifier {
  func body(content: Content) -> some View {
    if #available(iOSApplicationExtension 17.0, *) {
      content.containerBackground(.clear, for: .widget)
    } else {
      content
    }
  }
}

extension View {
  func wallCalWidgetBackground() -> some View {
    modifier(WallCalWidgetBackground())
  }
  func wallCalMediumBackground() -> some View {
    modifier(WallCalMediumBackground())
  }
}

private func categoryIcon(for category: String) -> String {
  switch category {
  case "birthday": return "🎂"
  case "anniversary": return "💍"
  case "appointment": return "🏥"
  case "payment": return "💳"
  case "loan": return "🏦"
  case "return": return "↩️"
  default: return "📌"
  }
}

private func categoryColor(for category: String) -> Color {
  switch category {
  case "birthday": return Color(red: 0.98, green: 0.36, blue: 0.65)
  case "anniversary": return Color(red: 0.65, green: 0.28, blue: 0.87)
  case "appointment": return Color(red: 0.18, green: 0.56, blue: 0.90)
  case "payment": return Color(red: 0.18, green: 0.72, blue: 0.38)
  case "loan": return Color(red: 0.96, green: 0.58, blue: 0.10)
  case "return": return Color(red: 0.38, green: 0.62, blue: 0.58)
  default: return Color(red: 0.42, green: 0.42, blue: 0.55)
  }
}

// MARK: - Widget Configurations

struct WallCalWidget: Widget {
  let kind: String = "WallCalWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: WallCalProvider()) { entry in
      WallCalRectangularView(entry: entry)
        .wallCalWidgetBackground()
    }
    .configurationDisplayName("WallCal Next Reminder")
    .description("See your next important reminder at a glance.")
    .supportedFamilies([.accessoryRectangular])
  }
}

struct WallCalCircularWidget: Widget {
  let kind: String = "WallCalCircularWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: WallCalProvider()) { entry in
      WallCalCircularView(entry: entry)
        .wallCalWidgetBackground()
    }
    .configurationDisplayName("WallCal Countdown")
    .description("Compact countdown for your next reminder.")
    .supportedFamilies([.accessoryCircular])
  }
}

struct WallCalInlineWidget: Widget {
  let kind: String = "WallCalInlineWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: WallCalProvider()) { entry in
      WallCalInlineView(entry: entry)
    }
    .configurationDisplayName("WallCal Inline")
    .description("Single-line next reminder summary.")
    .supportedFamilies([.accessoryInline])
  }
}

struct WallCalMediumWidget: Widget {
  let kind: String = "WallCalMediumWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: WallCalProvider()) { entry in
      WallCalMediumView(entry: entry)
        .wallCalMediumBackground()
    }
    .configurationDisplayName("WallCal Event")
    .description("See your next reminder in full detail.")
    .supportedFamilies([.systemMedium])
  }
}

@main
struct WallCalWidgetBundle: WidgetBundle {
  var body: some Widget {
    WallCalWidget()
    WallCalCircularWidget()
    WallCalInlineWidget()
    WallCalMediumWidget()
  }
}
