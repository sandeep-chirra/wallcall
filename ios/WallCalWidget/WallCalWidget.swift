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
      upcomingCount: 3
    )
  }

  func getSnapshot(in context: Context, completion: @escaping (WallCalEntry) -> Void) {
    completion(makeEntry())
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<WallCalEntry>) -> Void) {
    let entry = makeEntry()
    let nextRefresh = Calendar.current.date(byAdding: .hour, value: 6, to: Date()) ?? Date().addingTimeInterval(21600)
    completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
  }

  private func makeEntry() -> WallCalEntry {
    let events = loadEvents()
    let datedEvents = events.compactMap { event -> (WallCalWidgetEvent, Int)? in
      guard let days = computeDaysUntil(event: event) else { return nil }
      return (event, days)
    }

    let sortedEvents = datedEvents.sorted { lhs, rhs in
      if lhs.1 == rhs.1 {
        return lhs.0.title < rhs.0.title
      }
      return lhs.1 < rhs.1
    }

    let selected = sortedEvents.first

    return WallCalEntry(
      date: Date(),
      event: selected?.0,
      daysRemaining: selected?.1,
      upcomingCount: datedEvents.count
    )
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

  private func computeDaysUntil(event: WallCalWidgetEvent) -> Int? {
    let formatter = DateFormatter()
    formatter.calendar = Calendar(identifier: .gregorian)
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "yyyy-MM-dd"

    guard let sourceDate = formatter.date(from: event.date) else {
      return nil
    }

    let calendar = Calendar.current
    let now = calendar.startOfDay(for: Date())
    var target = calendar.startOfDay(for: sourceDate)

    if event.category == "birthday" || event.category == "anniversary" {
      let month = calendar.component(.month, from: sourceDate)
      let day = calendar.component(.day, from: sourceDate)
      target = calendar.date(from: DateComponents(year: calendar.component(.year, from: now), month: month, day: day)) ?? target
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

    return calendar.dateComponents([.day], from: now, to: target).day
  }
}

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

extension View {
  func wallCalWidgetBackground() -> some View {
    modifier(WallCalWidgetBackground())
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

@main
struct WallCalWidgetBundle: WidgetBundle {
  var body: some Widget {
    WallCalWidget()
    WallCalCircularWidget()
    WallCalInlineWidget()
  }
}
