//
//  LegacyMessages.swift
//  iDecide
//
//  Created by hamish leahy on 17/8/2024.
//

import SwiftUI

struct LegacyMessagesView: View {
    @State private var messages: [LegacyMessage] = []
    @State private var isAddingMessage = false

    var body: some View {
        List {
            ForEach(messages) { message in
                LegacyMessageRow(message: message)
            }
            .onDelete(perform: deleteMessages)

            Button(action: { isAddingMessage = true }) {
                Label("Add Message", systemImage: "plus")
            }
        }
        .navigationTitle("Legacy Messages")
        .sheet(isPresented: $isAddingMessage) {
            AddLegacyMessageView(messages: $messages)
        }
    }

    private func deleteMessages(at offsets: IndexSet) {
        messages.remove(atOffsets: offsets)
    }
}

struct LegacyMessageRow: View {
    let message: LegacyMessage

    var body: some View {
        HStack {
            Image(systemName: message.type.iconName)
            VStack(alignment: .leading) {
                Text(message.recipient)
                Text(message.type.rawValue)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}

struct AddLegacyMessageView: View {
    @Binding var messages: [LegacyMessage]
    @State private var recipient = ""
    @State private var messageType = MessageType.text
    @State private var content = ""
    @Environment(\.presentationMode) var presentationMode

    var body: some View {
        NavigationView {
            Form {
                TextField("Recipient", text: $recipient)
                Picker("Message Type", selection: $messageType) {
                    ForEach(MessageType.allCases, id: \.self) { type in
                        Text(type.rawValue).tag(type)
                    }
                }
                if messageType == .text {
                    TextEditor(text: $content)
                        .frame(height: 200)
                } else {
                    Text("Recording functionality to be implemented")
                }
                Button("Save") {
                    let newMessage = LegacyMessage(recipient: recipient, type: messageType, content: content)
                    messages.append(newMessage)
                    presentationMode.wrappedValue.dismiss()
                }
            }
            .navigationTitle("Add Legacy Message")
        }
    }
}

struct LegacyMessage: Identifiable {
    let id = UUID()
    let recipient: String
    let type: MessageType
    let content: String
}

enum MessageType: String, CaseIterable {
    case text = "Text"
    case audio = "Audio"
    case video = "Video"

    var iconName: String {
        switch self {
        case .text: return "doc.text.fill"
        case .audio: return "waveform"
        case .video: return "video.fill"
        }
    }
}

struct LegacyMessagesView_Previews: PreviewProvider {
    static var previews: some View {
        LegacyMessagesView()
    }
}
