import { AppLanguage } from "../types";

export const translations: Record<AppLanguage, {
  brand: string;
  nav: {
    home: string;
    chat: string;
    translate: string;
    studio: string;
    voice: string;
  };
  dashboard: {
    greeting: string;
    headline: string;
    subheadline: string;
    startChat: string;
    openTranslator: string;
    toolsTitle: string;
    toolsSubtitle: string;
    features: {
      chatTitle: string;
      chatDesc: string;
      translateTitle: string;
      translateDesc: string;
      voiceTitle: string;
      voiceDesc: string;
      writeTitle: string;
      writeDesc: string;
      learnTitle: string;
      learnDesc: string;
      summarizeTitle: string;
      summarizeDesc: string;
      imageTitle: string;
      imageDesc: string;
    };
  };
  chat: {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    clear: string;
    copy: string;
    copied: string;
    speak: string;
    stopSpeaking: string;
    listening: string;
    micUnsupported: string;
    emptyTitle: string;
    emptySubtitle: string;
    suggestions: string[];
  };
  translator: {
    title: string;
    subtitle: string;
    english: string;
    hausa: string;
    swap: string;
    clear: string;
    copy: string;
    copied: string;
    translateBtn: string;
    translating: string;
    sourcePlaceholderEn: string;
    sourcePlaceholderHa: string;
    resultPlaceholder: string;
    modes: {
      standard: string;
      formal: string;
      conversational: string;
    };
    nuanceLabel: string;
    listen: string;
    retry: string;
    emptyError: string;
  };
  voice: {
    title: string;
    subtitle: string;
    tapToSpeak: string;
    listening: string;
    processing: string;
    speaking: string;
    stopAudio: string;
    transcriptLabel: string;
    replyLabel: string;
    fallbackPlaceholder: string;
    sendText: string;
    unsupportedNotice: string;
    hint: string;
  };
  studio: {
    title: string;
    subtitle: string;
    tabs: {
      write: string;
      learn: string;
      summarize: string;
      image: string;
    };
    write: {
      categoryLabel: string;
      categories: {
        letter: string;
        story: string;
        caption: string;
        business: string;
      };
      toneLabel: string;
      tones: {
        professional: string;
        warm: string;
        persuasive: string;
        creative: string;
      };
      topicPlaceholder: string;
      generateBtn: string;
      generating: string;
    };
    learn: {
      levelLabel: string;
      levels: {
        beginner: string;
        intermediate: string;
        advanced: string;
      };
      topicPlaceholder: string;
      explainBtn: string;
      explaining: string;
    };
    summarize: {
      lengthLabel: string;
      lengths: {
        brief: string;
        standard: string;
        detailed: string;
      };
      textPlaceholder: string;
      summarizeBtn: string;
      summarizing: string;
    };
    image: {
      promptPlaceholder: string;
      aspectLabel: string;
      generateBtn: string;
      generating: string;
      download: string;
      emptyState: string;
    };
    copy: string;
    copied: string;
    clear: string;
  };
  common: {
    errorTitle: string;
    retry: string;
    dismiss: string;
    networkError: string;
  };
}> = {
  en: {
    brand: "AFRITECH AI",
    nav: {
      home: "Home",
      chat: "Chat",
      translate: "Translate",
      studio: "Studio",
      voice: "Voice",
    },
    dashboard: {
      greeting: "Welcome to AFRITECH AI",
      headline: "Intelligent AI built for clarity, speed, and bilingual fluency.",
      subheadline: "Converse naturally, translate between English and Hausa across three registers, draft documents, learn faster, and summarize long texts.",
      startChat: "Start AI Chat",
      openTranslator: "Hausa Translator",
      toolsTitle: "AI Workspace",
      toolsSubtitle: "Select any capability to begin immediately",
      features: {
        chatTitle: "AI Chat",
        chatDesc: "Intelligent multi-turn conversations in English or Hausa.",
        translateTitle: "Hausa Translator",
        translateDesc: "English & Hausa translation in Standard, Formal, and Conversational modes.",
        voiceTitle: "Voice Assistant",
        voiceDesc: "Speak naturally with hands-free speech recognition and voice playback.",
        writeTitle: "AI Writing",
        writeDesc: "Draft polished letters, stories, social captions, and business emails.",
        learnTitle: "AI Learning",
        learnDesc: "Clear explanations, examples, and self-check quizzes on any topic.",
        summarizeTitle: "AI Summarizer",
        summarizeDesc: "Distill long articles, notes, or reports into crisp key takeaways.",
        imageTitle: "AI Image Studio",
        imageDesc: "Create custom visuals from text prompts with selectable aspect ratios.",
      },
    },
    chat: {
      title: "AI Chat",
      subtitle: "Ask questions, brainstorm ideas, or practice Hausa and English.",
      placeholder: "Ask AFRITECH AI anything...",
      send: "Send",
      clear: "Clear",
      copy: "Copy",
      copied: "Copied",
      speak: "Listen",
      stopSpeaking: "Stop",
      listening: "Listening...",
      micUnsupported: "Voice input is not supported on this browser. Please type your message.",
      emptyTitle: "How can AFRITECH AI help today?",
      emptySubtitle: "Start a conversation below or choose a quick prompt.",
      suggestions: [
        "Explain how solar microgrids help rural businesses",
        "Write a polite business greeting in Hausa and English",
        "Give me 5 productivity tips for software engineers",
      ],
    },
    translator: {
      title: "Hausa Translator",
      subtitle: "Accurate English & Hausa translation with register control.",
      english: "English",
      hausa: "Hausa",
      swap: "Swap languages",
      clear: "Clear",
      copy: "Copy",
      copied: "Copied",
      translateBtn: "Translate",
      translating: "Translating...",
      sourcePlaceholderEn: "Enter English text to translate into Hausa...",
      sourcePlaceholderHa: "Rubuta Hausa don fassara zuwa Turanci...",
      resultPlaceholder: "Your translation will appear here.",
      modes: {
        standard: "Standard",
        formal: "Formal",
        conversational: "Conversational",
      },
      nuanceLabel: "Context note",
      listen: "Listen",
      retry: "Try again",
      emptyError: "Please enter some text before translating.",
    },
    voice: {
      title: "Voice Assistant",
      subtitle: "Speak to AFRITECH AI and hear instant spoken responses.",
      tapToSpeak: "Tap to speak",
      listening: "Listening... tap to stop",
      processing: "Thinking...",
      speaking: "Speaking response...",
      stopAudio: "Stop audio",
      transcriptLabel: "You said",
      replyLabel: "AFRITECH AI",
      fallbackPlaceholder: "Or type a message for spoken reply...",
      sendText: "Ask",
      unsupportedNotice: "Speech recognition is unavailable in this browser. You can type below and still hear spoken AI replies.",
      hint: "Works best on Android Chrome, Edge, or Safari with microphone access enabled.",
    },
    studio: {
      title: "AI Creative & Study Studio",
      subtitle: "Writing, learning, summarization, and image generation in one place.",
      tabs: {
        write: "Writing",
        learn: "Learning",
        summarize: "Summarizer",
        image: "Images",
      },
      write: {
        categoryLabel: "Format",
        categories: {
          letter: "Letter",
          story: "Story",
          caption: "Captions",
          business: "Business",
        },
        toneLabel: "Tone",
        tones: {
          professional: "Professional",
          warm: "Warm",
          persuasive: "Persuasive",
          creative: "Creative",
        },
        topicPlaceholder: "Describe what you need written (e.g., A formal partnership letter to a Lagos tech hub)...",
        generateBtn: "Generate Writing",
        generating: "Writing...",
      },
      learn: {
        levelLabel: "Level",
        levels: {
          beginner: "Beginner",
          intermediate: "Intermediate",
          advanced: "Advanced",
        },
        topicPlaceholder: "Enter any topic or concept (e.g., How photosynthesis works, or Basics of Python)...",
        explainBtn: "Explain Topic",
        explaining: "Preparing lesson...",
      },
      summarize: {
        lengthLabel: "Summary length",
        lengths: {
          brief: "Brief",
          standard: "Standard",
          detailed: "Detailed",
        },
        textPlaceholder: "Paste a long article, meeting notes, or document here (at least 20 characters)...",
        summarizeBtn: "Summarize Text",
        summarizing: "Summarizing...",
      },
      image: {
        promptPlaceholder: "Describe the image you want to create (e.g., Modern architectural library in Abuja at golden hour)...",
        aspectLabel: "Aspect ratio",
        generateBtn: "Generate Image",
        generating: "Creating image...",
        download: "Download",
        emptyState: "Your generated artwork will appear here.",
      },
      copy: "Copy",
      copied: "Copied",
      clear: "Clear",
    },
    common: {
      errorTitle: "Request could not be completed",
      retry: "Retry",
      dismiss: "Dismiss",
      networkError: "Unable to reach AFRITECH AI servers. Please check your connection and try again.",
    },
  },
  ha: {
    brand: "AFRITECH AI",
    nav: {
      home: "Gida",
      chat: "Tattaunawa",
      translate: "Fassara",
      studio: "Aiki",
      voice: "Murya",
    },
    dashboard: {
      greeting: "Barka da zuwa AFRITECH AI",
      headline: "Basirar AI mai sauri, tsafta, da ƙwarewar harshen Hausa da Turanci.",
      subheadline: "Yi tattaunawa mai ma'ana, fassara tsakanin Turanci da Hausa a salo uku, rubuta wasiƙu, koyo cikin sauƙi, da taƙaita dogon bayani.",
      startChat: "Fara Tattaunawa",
      openTranslator: "Mai Fassara",
      toolsTitle: "Sassan Aiki na AI",
      toolsSubtitle: "Zaɓi ɓangaren da kake so don farawa nan take",
      features: {
        chatTitle: "Tattaunawa da AI",
        chatDesc: "Tattaunawa mai zurfi cikin harshen Hausa ko Turanci.",
        translateTitle: "Fassarar Hausa",
        translateDesc: "Fassara tsakanin Turanci da Hausa cikin salo na yau da kullum, na girmamawa, ko na hira.",
        voiceTitle: "Muryar AI",
        voiceDesc: "Yi magana da murya kuma ka saurari amsar AI kai tsaye.",
        writeTitle: "Rubutu da AI",
        writeDesc: "Rubuta wasiƙu, labarai, saƙonnin sada zumunta, da takardun kasuwanci.",
        learnTitle: "Koyo da AI",
        learnDesc: "Bayani mai sauƙin fahimta, misalai, da tambayoyin gwaji kan kowane fanni.",
        summarizeTitle: "Taƙaita Bayani",
        summarizeDesc: "Mayar da dogon rubutu ko rahoto zuwa taƙaitaccen bayani mai muhimmanci.",
        imageTitle: "Ƙirƙirar Hoto",
        imageDesc: "Ƙirƙiri hotuna masu kyau daga rubutu tare da zaɓin girman hoto.",
      },
    },
    chat: {
      title: "Tattaunawa da AI",
      subtitle: "Yi tambaya, nemi shawara, ko tattauna cikin Hausa da Turanci.",
      placeholder: "Tambayi AFRITECH AI komai...",
      send: "Aika",
      clear: "Share",
      copy: "Kwafi",
      copied: "An kwafa",
      speak: "Saurara",
      stopSpeaking: "Tsayar",
      listening: "Ana saurare...",
      micUnsupported: "Wannan manhaja ba ta goyan bayan magana da murya ba. Da fatan za a rubuta saƙo.",
      emptyTitle: "Ta yaya AFRITECH AI zai taimake ka yau?",
      emptySubtitle: "Fara tattaunawa a ƙasa ko zaɓi ɗaya daga cikin misalan.",
      suggestions: [
        "Bayyana amfanin hasken rana wajen bunƙasa ƙananan sana'o'i",
        "Rubuta gaisuwar kasuwanci mai girmamawa cikin Hausa da Turanci",
        "Ba ni shawarwari 5 don ƙara ƙwazo a aikin kwamfuta",
      ],
    },
    translator: {
      title: "Mai Fassarar Hausa",
      subtitle: "Fassara ingantacciya tsakanin Turanci da Hausa.",
      english: "Turanci",
      hausa: "Hausa",
      swap: "Musanya harsuna",
      clear: "Share",
      copy: "Kwafi",
      copied: "An kwafa",
      translateBtn: "Fassara",
      translating: "Ana fassarawa...",
      sourcePlaceholderEn: "Shigar da rubutun Turanci don fassarawa zuwa Hausa...",
      sourcePlaceholderHa: "Rubuta Hausa don fassara zuwa Turanci...",
      resultPlaceholder: "Fassarar za ta bayyana a nan.",
      modes: {
        standard: "Daidaitacce",
        formal: "Na Girmamawa",
        conversational: "Na Hira",
      },
      nuanceLabel: "Ƙarin bayani",
      listen: "Saurara",
      retry: "Sake gwadawa",
      emptyError: "Da fatan za a rubuta abin da za a fassara tukuna.",
    },
    voice: {
      title: "Muryar AI",
      subtitle: "Yi magana da AFRITECH AI kuma ka ji amsa nan take.",
      tapToSpeak: "Danna don magana",
      listening: "Ana saurare... danna don tsayawa",
      processing: "Ana tunani...",
      speaking: "Ana karanta amsa...",
      stopAudio: "Tsayar da murya",
      transcriptLabel: "Abinda ka faɗa",
      replyLabel: "AFRITECH AI",
      fallbackPlaceholder: "Ko rubuta tambaya don jin amsa da murya...",
      sendText: "Tambaya",
      unsupportedNotice: "Magana da murya ba ta aiki a wannan browser. Za ka iya rubutawa a ƙasa don jin amsar AI da murya.",
      hint: "Yana aiki sosai a Android Chrome, Edge, ko Safari idan an ba da izinin makirifo.",
    },
    studio: {
      title: "Ɗakin Aiki na AI",
      subtitle: "Rubutu, koyo, taƙaitawa, da ƙirƙirar hoto a wuri guda.",
      tabs: {
        write: "Rubutu",
        learn: "Koyo",
        summarize: "Taƙaitawa",
        image: "Hotuna",
      },
      write: {
        categoryLabel: "Nau'i",
        categories: {
          letter: "Wasiƙa",
          story: "Labari",
          caption: "Taken Hoto",
          business: "Kasuwanci",
        },
        toneLabel: "Salo",
        tones: {
          professional: "Na Aiki",
          warm: "Na Abota",
          persuasive: "Mai Gamsarwa",
          creative: "Na Ƙirƙira",
        },
        topicPlaceholder: "Bayyana abin da kake son a rubuta (misali: Wasiƙar neman haɗin gwiwar kasuwanci)...",
        generateBtn: "Rubuta Yanzu",
        generating: "Ana rubutawa...",
      },
      learn: {
        levelLabel: "Mataki",
        levels: {
          beginner: "Mafarin Koyo",
          intermediate: "Matsakaici",
          advanced: "Ƙwararre",
        },
        topicPlaceholder: "Shigar da batun da kake son koyo (misali: Yadda tsirrai ke sarrafa abinci, ko tushen Python)...",
        explainBtn: "Bayyana Batu",
        explaining: "Ana shirya darasi...",
      },
      summarize: {
        lengthLabel: "Tsawon taƙaitawa",
        lengths: {
          brief: "Gajere",
          standard: "Matsakaici",
          detailed: "Cikakke",
        },
        textPlaceholder: "Manna dogon labari ko bayani a nan (akalla haruffa 20)...",
        summarizeBtn: "Taƙaita Bayani",
        summarizing: "Ana taƙaitawa...",
      },
      image: {
        promptPlaceholder: "Bayyana hoton da kake son ƙirƙira (misali: Babban ɗakin karatu na zamani a Kano da yamma)...",
        aspectLabel: "Girman hoto",
        generateBtn: "Ƙirƙiri Hoto",
        generating: "Ana ƙirƙirar hoto...",
        download: "Sauke Hoto",
        emptyState: "Hoton da aka ƙirƙira zai bayyana a nan.",
      },
      copy: "Kwafi",
      copied: "An kwafa",
      clear: "Share",
    },
    common: {
      errorTitle: "Ba a samu nasarar kammala buƙatar ba",
      retry: "Sake gwadawa",
      dismiss: "Rufe",
      networkError: "Ba a iya haɗuwa da uwar garken AFRITECH AI ba. Duba yanar gizonka ka sake gwadawa.",
    },
  },
};
