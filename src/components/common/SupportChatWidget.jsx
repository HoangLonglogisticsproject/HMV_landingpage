import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  Minus,
  Send,
  Paperclip,
  Smile,
  ChevronRight,
  Headphones,
  Sprout,
  FileText,
  Ship,
  UserCheck,
  Globe,
  Mail,
  User,
  CheckCheck,
  ArrowUpRight,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { productPhotos } from '@/data/productPhotos';
import logo from '@/assets/hmv-official-logo.webp.asset.json';

export function SupportChatWidget({ lang = 'vi' }) {
  const vi = lang === 'vi';
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);

  // Auto-scroll to bottom of messages only on new interactive messages or typing
  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // When modal is newly opened, start at the top so Welcome message and Quick Actions are clearly visible
  useEffect(() => {
    if (isOpen && !isMinimized && chatBodyRef.current && messages.length === 0) {
      chatBodyRef.current.scrollTop = 0;
    }
  }, [isOpen, isMinimized, messages.length]);

  // Listen for global custom event to open chat from navbar or buttons
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('open-hmv-support-chat', handleOpenChat);
    return () => window.removeEventListener('open-hmv-support-chat', handleOpenChat);
  }, []);

  // Quick Action Buttons Data
  const quickActions = [
    {
      id: 'products',
      icon: Sprout,
      iconColor: 'text-emerald-600',
      title: 'Explore Products',
      titleVi: 'Khám Phá Sản Phẩm',
      sub: 'View our agricultural products',
      subVi: 'Danh mục nông sản xuất khẩu',
      action: () => handleQuickAction('products')
    },
    {
      id: 'quote',
      icon: FileText,
      iconColor: 'text-blue-600',
      title: 'Request a Trade Quote',
      titleVi: 'Yêu Cầu Báo Giá RFQ',
      sub: 'Get a tailored quotation',
      subVi: 'Báo giá xuất khẩu trực tiếp',
      action: () => handleQuickAction('quote')
    },
    {
      id: 'supply-chain',
      icon: Ship,
      iconColor: 'text-indigo-600',
      title: 'Supply Chain Support',
      titleVi: 'Hỗ Trợ Chuỗi Cung Ứng',
      sub: 'Logistics & coordination',
      subVi: 'Vận hành chuỗi lạnh & cảng',
      action: () => handleQuickAction('supply-chain')
    },
    {
      id: 'advisor',
      icon: UserCheck,
      iconColor: 'text-amber-600',
      title: 'Talk to an Advisor',
      titleVi: 'Tư Vấn Viên Chuyên Sâu',
      sub: 'Speak with our team',
      subVi: 'Kết nối trực tiếp chuyên gia',
      action: () => handleQuickAction('advisor')
    },
    {
      id: 'language',
      icon: Globe,
      iconColor: 'text-cyan-600',
      title: 'EN / VI',
      titleVi: 'VI / EN',
      sub: 'Switch language',
      subVi: 'Chuyển đổi ngôn ngữ',
      action: () => handleQuickAction('language')
    },
    {
      id: 'contact',
      icon: Mail,
      iconColor: 'text-rose-600',
      title: 'Leave Your Contact',
      titleVi: 'Để Lại Thông Tin',
      sub: "We'll get back to you",
      subVi: 'Phản hồi trong 15 phút',
      action: () => handleQuickAction('contact')
    }
  ];

  const handleQuickAction = (actionId) => {
    if (actionId === 'language') {
      const targetLang = lang === 'vi' ? 'en' : 'vi';
      const newPath = location.pathname.replace(/^\/(en|vi)/, `/${targetLang}`);
      navigate(newPath);
      return;
    }

    if (actionId === 'products') {
      addUserMessage(vi ? 'Tôi muốn tìm hiểu danh mục nông sản xuất khẩu của HMV Global.' : 'I want to explore HMV Global agricultural export products.');
      simulateBotReply(
        vi
          ? 'Dạ, HMV Global hiện cung cấp các mặt hàng nông sản chủ lực đạt chuẩn GlobalGAP, kiểm soát dư lượng MRLs cho thị trường EU & Mỹ: Chanh dây tươi & puree, Chuối Cavendish, Thanh long ruột đỏ/trắng, Tiêu Phú Quốc, Hạt điều và Tinh bột sắn. Quý khách có thể xem chi tiết từng quy cách tại trang Chuỗi cung ứng!'
          : 'HMV Global supplies export-grade produce certified under GlobalGAP & strict EU/US MRLs residue compliance: Fresh & processed Passion fruit, Cavendish bananas, Dragon fruit, Vietnamese spices, Cashew kernels, and Tapioca starch. You can inspect all specifications in our Supply Chain catalogue!'
      );
      return;
    }

    if (actionId === 'quote') {
      addUserMessage(vi ? 'Tôi muốn nhận báo giá thương mại (RFQ) cho lô hàng xuất khẩu.' : 'I would like to request a trade quotation (RFQ) for an export consignment.');
      simulateBotReply(
        vi
          ? 'Quý đối tác có thể gửi yêu cầu báo giá trực tiếp qua form RFQ trực tuyến của HMV Global tại chân trang chủ, hoặc để lại email/WhatsApp để chuyên viên thương mại gửi chào giá FOB/CIF trong 24h.'
          : 'You can submit your formal Trade RFQ directly through our online portal or leave your email/WhatsApp. Our commercial trading desk will deliver a tailored FOB/CIF proposal within 24 hours.'
      );
      return;
    }

    if (actionId === 'supply-chain') {
      addUserMessage(vi ? 'HMV Global có thể hỗ trợ điều phối logistics và kiểm dịch như thế nào?' : 'How does HMV Global coordinate logistics and phytosanitary compliance?');
      simulateBotReply(
        vi
          ? 'Chúng tôi làm chủ 100% chuỗi cung ứng khép kín: Giám sát nhiệt độ chuỗi lạnh (Cold chain), xử lý pallet gỗ ISPM 15 chuẩn HT, cấp chứng thư kiểm dịch Phytosanitary và phân tích dư lượng ISO 17025 trước khi xuất bến.'
          : 'We maintain 100% end-to-end operational control: continuous Cold Chain temperature logging, ISPM 15 HT heat-treated pallets, mandatory Phytosanitary certificates, and ISO 17025 pre-shipment laboratory COA releases.'
      );
      return;
    }

    if (actionId === 'advisor') {
      addUserMessage(vi ? 'Tôi muốn kết nối trực tiếp với chuyên gia tư vấn thương mại.' : 'I would like to speak directly with a commercial trade advisor.');
      simulateBotReply(
        vi
          ? 'Chuyên viên HMV Global luôn sẵn sàng 24/7! Quý đối tác vui lòng gọi Hotline (+84) 902 468 910 hoặc gửi email về vannguyen@hmvglobal.com. Chúng tôi phản hồi ngay lập tức.'
          : 'Our senior trade advisors are on standby 24/7! You may reach us at Hotline (+84) 902 468 910 or email vannguyen@hmvglobal.com. We respond promptly.'
      );
      return;
    }

    if (actionId === 'contact') {
      addUserMessage(vi ? 'Tôi muốn để lại thông tin liên hệ để được tư vấn.' : 'I want to leave my contact details for consultation.');
      simulateBotReply(
        vi
          ? 'Cảm ơn quý đối tác! Bạn có thể nhập thông tin (Email, Số điện thoại, Tên công ty) ngay trong khung chat này hoặc truy cập trang Liên hệ của chúng tôi.'
          : 'Thank you! You can type your contact details (Email, Phone/WhatsApp, Company) right here in this chat, or visit our Contact desk.'
      );
      return;
    }
  };

  const addUserMessage = (text) => {
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const simulateBotReply = (text) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 700);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const query = inputText.trim();
    setInputText('');
    addUserMessage(query);

    // Simulate intelligent bot response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply = vi
        ? `Cảm ơn quý đối tác đã liên hệ về "${query}". Chuyên viên điều phối HMV Global đã ghi nhận và sẽ hỗ trợ giải đáp chi tiết cùng tài liệu chứng từ đi kèm!`
        : `Thank you for your inquiry regarding "${query}". Our HMV Global trade coordinator has received your message and will provide full specifications and documentation!`;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 900);
  };

  return (
    <>
      {/* 1. FLOATING LAUNCHER BUTTON (When widget is closed or minimized) */}
      {!isOpen && (
        <button
          id="chat-launcher-btn"
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="hmv-floating-chat-launcher"
          aria-label={vi ? 'Mở cửa sổ Hỗ trợ 24/7' : 'Open 24/7 Support Chat'}
        >
          <div className="launcher-pulse-indicator" aria-hidden="true" />
          <div className="launcher-icon-wrap">
            <Headphones size={18} />
          </div>
          <span className="launcher-text">{vi ? 'Hỗ trợ 24/7' : '24/7 Support'}</span>
          <span className="launcher-badge">ONLINE</span>
        </button>
      )}

      {/* 2. MINIMIZED FLOATING BAR */}
      {isOpen && isMinimized && (
        <div
          className="hmv-chat-minimized-bar"
          onClick={() => setIsMinimized(false)}
          role="button"
          tabIndex={0}
        >
          <div className="min-bar-left">
            <span className="live-status-dot" />
            <span className="min-bar-title">HMV Support 24/7</span>
          </div>
          <div className="min-bar-actions">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="min-bar-btn"
              title="Expand"
            >
              +
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="min-bar-btn"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 3. APPLE-STYLE FLOATING CHAT WIDGET */}
      {isOpen && !isMinimized && (
        <div className="hmv-apple-chat-modal" role="dialog" aria-label="HMV Global 24/7 Support">
          {/* A. HEADER AREA (Brand & Status with faint dotted background) */}
          <div className="apple-chat-header">
            <div className="chat-header-brand">
              <div className="chat-brand-avatar">
                <img
                  src={logo.url}
                  alt="HMV Global"
                  className="chat-avatar-img"
                  width={36}
                  height={36}
                />
              </div>
              <div className="chat-brand-meta">
                <h3 className="chat-brand-title">HMV Support 24/7</h3>
                <div className="chat-status-row">
                  <span className="live-status-dot" aria-hidden="true" />
                  <span className="chat-status-text">Online now</span>
                </div>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                id="chat-minimize-btn"
                type="button"
                onClick={() => setIsMinimized(true)}
                className="chat-action-btn"
                title={vi ? 'Thu nhỏ' : 'Minimize'}
                aria-label="Minimize"
              >
                <Minus size={15} />
              </button>
              <button
                id="chat-close-btn"
                type="button"
                onClick={() => setIsOpen(false)}
                className="chat-action-btn"
                title={vi ? 'Đóng' : 'Close'}
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* B. SCROLLABLE MESSAGES BODY */}
          <div className="apple-chat-body" ref={chatBodyRef}>
            {/* 1. Welcome Message (Bot) */}
            <div className="chat-msg-row bot-row">
              <div className="chat-avatar-circle">
                <img src={logo.url} alt="HMV Bot" className="w-6 h-6 object-contain" />
              </div>
              <div className="chat-bubble bot-bubble welcome-bubble">
                <p className="welcome-bold">Welcome to HMV Global.</p>
                <p className="welcome-regular">How can we support your supply chain today?</p>
                <p className="welcome-subtext">HMV luôn sẵn sàng hỗ trợ 24/7.</p>
              </div>
            </div>

            {/* 2. Quick Action Buttons (2x3 Grid) */}
            <div className="chat-quick-actions-grid">
              {quickActions.map((qa) => {
                const IconComponent = qa.icon;
                return (
                  <button
                    key={qa.id}
                    type="button"
                    onClick={qa.action}
                    className="quick-action-pill"
                  >
                    <div className="qa-left">
                      <div className={`qa-icon-wrap ${qa.iconColor}`}>
                        <IconComponent size={15} />
                      </div>
                      <div className="qa-text">
                        <strong className="qa-title">{vi ? qa.titleVi : qa.title}</strong>
                        <span className="qa-sub">{vi ? qa.subVi : qa.sub}</span>
                      </div>
                    </div>
                    <ChevronRight size={13} className="qa-arrow" />
                  </button>
                );
              })}
            </div>

            {/* 3. Sample User Message Bubble (Right-aligned, Light Blue, Deep Navy Text) */}
            <div className="chat-msg-row user-row">
              <span className="chat-timestamp">10:24 AM</span>
              <div className="chat-bubble user-bubble">
                <p>
                  Hi, I'm interested in sourcing fresh passion fruit from Vietnam. Could you provide
                  more information on availability, MOQ and estimated price?
                </p>
                <CheckCheck size={13} className="user-read-receipt" />
              </div>
              <div className="user-avatar-circle">
                <User size={15} />
              </div>
            </div>

            {/* 4. Bot Response with Rich Media Product Card */}
            <div className="chat-msg-row bot-row">
              <div className="chat-avatar-circle">
                <img src={logo.url} alt="HMV Bot" className="w-6 h-6 object-contain" />
              </div>
              <div className="chat-bubble bot-bubble">
                <p className="bot-response-text">
                  Great to hear from you! 🌱 We can help you source fresh passion fruit from Vietnam.
                  Let me share some key information:
                </p>

                {/* Inner Product Card */}
                <Link
                  to={`/${lang}/products/passion-fruit`}
                  onClick={() => setIsOpen(false)}
                  className="bot-inner-product-card"
                >
                  <figure className="inner-product-thumb">
                    <img
                      src={productPhotos['passion-fruit'].src}
                      alt="Fresh Passion Fruit (Vietnam)"
                      width={80}
                      height={80}
                      loading="lazy"
                    />
                  </figure>
                  <div className="inner-product-info">
                    <strong className="inner-product-title">Fresh Passion Fruit (Vietnam)</strong>
                    <ul className="inner-product-specs">
                      <li>
                        <strong>Available:</strong> Year-round (main season: Mar - Sep)
                      </li>
                      <li>
                        <strong>MOQ:</strong> 1 container (customizable)
                      </li>
                      <li>
                        <strong>Price:</strong> Please request a quote for latest offer
                      </li>
                      <li>
                        <strong>Export to:</strong> Global market
                      </li>
                    </ul>
                  </div>
                  <ChevronRight size={16} className="inner-product-arrow" />
                </Link>
              </div>
            </div>

            {/* Render any additional interactive messages typed by user */}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chat-msg-row ${m.sender === 'user' ? 'user-row' : 'bot-row'}`}
              >
                {m.sender === 'user' && <span className="chat-timestamp">{m.time}</span>}
                {m.sender === 'bot' && (
                  <div className="chat-avatar-circle">
                    <img src={logo.url} alt="HMV Bot" className="w-6 h-6 object-contain" />
                  </div>
                )}
                <div
                  className={`chat-bubble ${m.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}
                >
                  <p>{m.text}</p>
                  {m.sender === 'user' && <CheckCheck size={13} className="user-read-receipt" />}
                </div>
                {m.sender === 'user' && (
                  <div className="user-avatar-circle">
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-msg-row bot-row">
                <div className="chat-avatar-circle">
                  <img src={logo.url} alt="HMV Bot" className="w-6 h-6 object-contain" />
                </div>
                <div className="chat-bubble bot-bubble typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* C. THE INPUT AREA (FOOTER) */}
          <div className="apple-chat-footer">
            <form onSubmit={handleSend} className="chat-input-pill">
              <button
                type="button"
                className="input-tool-btn"
                title={vi ? 'Đính kèm tài liệu' : 'Attach file'}
                aria-label="Attach file"
              >
                <Paperclip size={17} />
              </button>

              <input
                id="chat-input-field"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={vi ? 'Nhập tin nhắn trao đổi...' : 'Type your message...'}
                className="chat-text-input"
              />

              <button
                type="button"
                className="input-tool-btn"
                title={vi ? 'Chèn biểu tượng' : 'Insert emoji'}
                aria-label="Insert emoji"
              >
                <Smile size={17} />
              </button>

              <button
                id="chat-send-btn"
                type="submit"
                disabled={!inputText.trim()}
                className="chat-send-btn"
                title={vi ? 'Gửi tin nhắn' : 'Send message'}
                aria-label="Send"
              >
                <Send size={15} />
              </button>
            </form>

            <p className="chat-footer-disclaimer">
              🎧 {vi ? 'Hỗ trợ 24/7 cho sản phẩm, chuỗi cung ứng & yêu cầu thương mại.' : '24/7 support for products, supply chain, and trade inquiries.'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
