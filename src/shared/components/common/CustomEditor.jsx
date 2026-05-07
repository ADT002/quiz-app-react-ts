import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  AtomicBlockUtils,
  DefaultDraftBlockRenderMap,
  convertToRaw,
  convertFromRaw,
  Modifier,
  ContentState,
  ContentBlock,
  SelectionState,
} from "draft-js";
import "draft-js/dist/Draft.css";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaQuoteRight,
  FaCode,
  FaListUl,
  FaListOl,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaImage,
  FaMusic,
  FaHeading,
  FaFont,
  FaSubscript,
  FaSuperscript,
  FaStrikethrough,
  FaSave,
  FaUndo,
  FaRedo,
} from "react-icons/fa";
import Immutable from "immutable";
import ImageManager from "../Image/ImageManager";
import OptionImage from "../Image/OptionImage";

// Constants được tách riêng và memoized
const CONSTANTS = {
  FONT_SIZES: [12, 14, 16, 18, 20, 24, 28, 32],
  FONT_FAMILIES: ["Arial", "Times New Roman", "Courier New", "Verdana"],
  HEADER_LEVELS: ["one", "two", "three", "four", "five", "six"],
  TOOLBAR_TYPES: {
    INLINE: "inline",
    BLOCK: "block",
    ALIGNMENT: "alignment",
    MEDIA: "media",
  },
  ALIGNMENTS: {
    LEFT: "left",
    CENTER: "center",
    RIGHT: "right",
  },
};

// Utility function để phân tích kiểu block
const parseBlockType = (blockType) => {
  // Format mẫu: "base-type alignment-X"
  const parts = blockType.split(" ");
  const baseType = parts[0]; // Kiểu block cơ bản (heading, list, etc.)
  const alignment =
    parts.find((part) => part.startsWith("align-")) ||
    CONSTANTS.ALIGNMENTS.LEFT;

  return { baseType, alignment };
};

// Utility function để tạo kiểu block mới
const createBlockType = (baseType, alignment) => {
  if (baseType === "unstyled" && alignment === CONSTANTS.ALIGNMENTS.LEFT) {
    return "unstyled"; // Default case
  }
  return `${baseType} ${alignment}`.trim();
};

// Custom Style Hook để tối ưu việc sử dụng các style
const useCustomStyles = () => {
  return useMemo(
    () => ({
      customStyleMap: {
        SUBSCRIPT: { fontSize: "0.7em", verticalAlign: "sub" },
        SUPERSCRIPT: { fontSize: "0.7em", verticalAlign: "super" },
        STRIKETHROUGH: { textDecoration: "line-through" },
      },
      fontStyleMap: CONSTANTS.FONT_SIZES.reduce((styles, size) => {
        styles[`FONTSIZE_${size}`] = { fontSize: `${size}px` };
        return styles;
      }, {}),
      fontFamilyStyleMap: CONSTANTS.FONT_FAMILIES.reduce((styles, font) => {
        styles[`FONTFAMILY_${font.replace(/\s+/g, "_")}`] = {
          fontFamily: font,
        };
        return styles;
      }, {}),
    }),
    []
  );
};

// Các cấu hình toolbar được tách ra và memoized
const useToolbarConfig = () => {
  return useMemo(
    () => ({
      TOOLBAR_CONFIG: [
        {
          Icon: FaBold,
          style: "BOLD",
          type: CONSTANTS.TOOLBAR_TYPES.INLINE,
          label: "Bold",
        },
        {
          Icon: FaItalic,
          style: "ITALIC",
          type: CONSTANTS.TOOLBAR_TYPES.INLINE,
          label: "Italic",
        },
        {
          Icon: FaUnderline,
          style: "UNDERLINE",
          type: CONSTANTS.TOOLBAR_TYPES.INLINE,
          label: "Underline",
        },
        {
          Icon: FaStrikethrough,
          style: "STRIKETHROUGH",
          type: CONSTANTS.TOOLBAR_TYPES.INLINE,
          label: "Strikethrough",
        },
        {
          Icon: FaSubscript,
          style: "SUBSCRIPT",
          type: CONSTANTS.TOOLBAR_TYPES.INLINE,
          label: "Subscript",
        },
        {
          Icon: FaSuperscript,
          style: "SUPERSCRIPT",
          type: CONSTANTS.TOOLBAR_TYPES.INLINE,
          label: "Superscript",
        },
        {
          Icon: FaQuoteRight,
          style: "blockquote",
          type: CONSTANTS.TOOLBAR_TYPES.BLOCK,
          label: "Blockquote",
        },
        {
          Icon: FaCode,
          style: "code-block",
          type: CONSTANTS.TOOLBAR_TYPES.BLOCK,
          label: "Code Block",
        },
        {
          Icon: FaListUl,
          style: "unordered-list-item",
          type: CONSTANTS.TOOLBAR_TYPES.BLOCK,
          label: "Bullet List",
        },
        {
          Icon: FaListOl,
          style: "ordered-list-item",
          type: CONSTANTS.TOOLBAR_TYPES.BLOCK,
          label: "Numbered List",
        },
        ...CONSTANTS.HEADER_LEVELS.map((level, i) => ({
          Icon: i < 1 ? FaHeading : FaFont,
          style: `header-${level}`,
          type: CONSTANTS.TOOLBAR_TYPES.BLOCK,
          label: `Heading ${i + 1}`,
        })),
      ],
      ALIGNMENT_CONFIG: [
        {
          Icon: FaAlignLeft,
          alignment: CONSTANTS.ALIGNMENTS.LEFT,
          type: CONSTANTS.TOOLBAR_TYPES.ALIGNMENT,
          label: "Align Left",
        },
        {
          Icon: FaAlignCenter,
          alignment: CONSTANTS.ALIGNMENTS.CENTER,
          type: CONSTANTS.TOOLBAR_TYPES.ALIGNMENT,
          label: "Align Center",
        },
        {
          Icon: FaAlignRight,
          alignment: CONSTANTS.ALIGNMENTS.RIGHT,
          type: CONSTANTS.TOOLBAR_TYPES.ALIGNMENT,
          label: "Align Right",
        },
      ],
      MEDIA_CONFIG: [
        {
          id: "image-upload",
          Icon: FaImage,
          mediaType: "IMAGE",
          accept: "image/*",
          type: CONSTANTS.TOOLBAR_TYPES.MEDIA,
          label: "Insert Image",
        },
        {
          id: "audio-upload",
          Icon: FaMusic,
          mediaType: "AUDIO",
          accept: "audio/*",
          type: CONSTANTS.TOOLBAR_TYPES.MEDIA,
          label: "Insert Audio",
        },
      ],
      HISTORY_ACTIONS: [
        { Icon: FaUndo, action: "undo", label: "Undo" },
        { Icon: FaRedo, action: "redo", label: "Redo" },
        { Icon: FaSave, action: "save", label: "Save" },
      ],
    }),
    []
  );
};

// Các component con được tách riêng để tăng khả năng bảo trì
const ToolbarButton = React.memo(({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    title={label}
    className={`p-1 hover:bg-gray-200 rounded ${active ? "bg-gray-200" : ""}`}
  >
    <Icon className="w-5 h-5" />
  </button>
));

const Divider = React.memo(() => (
  <div className="border-r border-gray-300 h-6 mx-2" />
));

const FontControls = React.memo(
  ({ fontFamily, fontSize, onChangeFontFamily, onChangeFontSize }) => (
    <>
      <select
        value={fontFamily}
        onChange={(e) => onChangeFontFamily(e.target.value)}
        className="p-1 border border-gray-300 rounded text-sm"
      >
        {CONSTANTS.FONT_FAMILIES.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>
      <select
        value={fontSize}
        onChange={(e) => onChangeFontSize(e.target.value)}
        className="p-1 border border-gray-300 rounded text-sm"
      >
        {CONSTANTS.FONT_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </>
  )
);

// Media Component
const MediaComponent = React.memo(({ block, contentState }) => {
  const entityKey = block.getEntityAt(0);
  if (!entityKey) return null;

  const entity = contentState.getEntity(entityKey);
  const { src } = entity.getData();
  const type = entity.getType();

  if (type === "IMAGE") {
    return (
      <OptionImage
        imageUrl={src}
        width="60%"
        className="rounded-lg shadow-sm object-cover my-2"
      />
    );
  }

  if (type === "AUDIO") {
    return <audio controls src={src} className="w-full my-2" />;
  }

  return null;
});

// Component chính đã được tối ưu
const CustomEditor = ({
  width = "100%",
  height = "300px",
  border = true,
  initialContent = null,
  onSave = null,
}) => {
  // Sử dụng hooks đã tạo
  const { customStyleMap, fontStyleMap, fontFamilyStyleMap } =
    useCustomStyles();
  const { TOOLBAR_CONFIG, ALIGNMENT_CONFIG, MEDIA_CONFIG, HISTORY_ACTIONS } =
    useToolbarConfig();

  // Editor state
  const [editorState, setEditorState] = useState(() => {
    if (initialContent) {
      try {
        const contentState = convertFromRaw(JSON.parse(initialContent));
        return EditorState.createWithContent(contentState);
      } catch (e) {
        console.error("Error loading initial content:", e);
      }
    }
    return EditorState.createEmpty();
  });

  // UI state
  const [isImageManageOpen, setImageManageOpen] = useState(false);
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [currentMediaType, setCurrentMediaType] = useState("IMAGE");

  const editorRef = useRef(null);

  // Tạo custom block render map cho tất cả các loại block + alignment
  const blockRenderMap = useMemo(() => {
    // Xây dựng map cho tất cả các kiểu block cơ bản
    const baseBlockMap = {
      "code-block": { element: "pre" },
      blockquote: { element: "blockquote" },
      unstyled: { element: "div" },
      "unordered-list-item": {
        element: "li",
        wrapper: <ul className="public-DraftStyleDefault-ul" />,
      },
      "ordered-list-item": {
        element: "li",
        wrapper: <ol className="public-DraftStyleDefault-ol" />,
      },
    };

    // Thêm các kiểu heading
    CONSTANTS.HEADER_LEVELS.forEach((level, index) => {
      baseBlockMap[`header-${level}`] = {
        element: `h${index + 1}`,
      };
    });

    // Tạo render map cho mỗi kiểu block kết hợp với alignment
    const extendedBlockMap = {};

    // Cho mỗi kiểu block cơ bản
    Object.keys(baseBlockMap).forEach((baseType) => {
      // Thêm kiểu block cơ bản (không có alignment)
      extendedBlockMap[baseType] = baseBlockMap[baseType];

      // Thêm các kiểu kết hợp với alignment
      Object.values(CONSTANTS.ALIGNMENTS).forEach((alignment) => {
        if (alignment !== CONSTANTS.ALIGNMENTS.LEFT) {
          // Default left không cần thêm
          const combinedType = `${baseType} align-${alignment}`.trim();
          extendedBlockMap[combinedType] = {
            ...baseBlockMap[baseType],
            // data kế thừa từ block base
          };
        }
      });
    });

    return DefaultDraftBlockRenderMap.merge(Immutable.Map(extendedBlockMap));
  }, []);

  // Phân tích blockType hiện tại để lấy thông tin cơ bản và alignment
  const getCurrentStyles = useCallback(() => {
    const selection = editorState.getSelection();
    const currentBlock = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey());

    const fullBlockType = currentBlock.getType();
    const { baseType, alignment } = parseBlockType(fullBlockType);

    return {
      fullBlockType,
      baseType,
      alignment,
      inlineStyle: editorState.getCurrentInlineStyle(),
    };
  }, [editorState]);

  // Xử lý font và căn chỉnh
  const handleFontChange = useCallback(
    (newFont) => {
      setFontFamily(newFont);
      const newStyle = `FONTFAMILY_${newFont.replace(/\s+/g, "_")}`;

      // Clear other font family styles
      const currentStyles = editorState.getCurrentInlineStyle().toArray();
      let nextState = editorState;

      currentStyles.forEach((style) => {
        if (style.startsWith("FONTFAMILY_") && style !== newStyle) {
          nextState = RichUtils.toggleInlineStyle(nextState, style);
        }
      });

      setEditorState(RichUtils.toggleInlineStyle(nextState, newStyle));
    },
    [editorState]
  );

  const handleFontSizeChange = useCallback(
    (newSize) => {
      setFontSize(newSize);
      const newStyle = `FONTSIZE_${newSize}`;

      // Clear other font size styles
      const currentStyles = editorState.getCurrentInlineStyle().toArray();
      let nextState = editorState;

      currentStyles.forEach((style) => {
        if (style.startsWith("FONTSIZE_") && style !== newStyle) {
          nextState = RichUtils.toggleInlineStyle(nextState, style);
        }
      });

      setEditorState(RichUtils.toggleInlineStyle(nextState, newStyle));
    },
    [editorState]
  );

  // Xử lý toggle style inline
  const toggleInlineStyle = useCallback(
    (style) => {
      setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    },
    [editorState]
  );

  // Xử lý thay đổi kiểu block, giữ nguyên alignment
  const toggleBlockType = useCallback(
    (blockType) => {
      const { alignment } = getCurrentStyles();
      const newCombinedType = createBlockType(blockType, alignment);
      setEditorState(RichUtils.toggleBlockType(editorState, newCombinedType));
    },
    [editorState, getCurrentStyles]
  );

  // Xử lý toggle style
  const toggleStyle = useCallback(
    (style, type) => {
      if (type === CONSTANTS.TOOLBAR_TYPES.INLINE) {
        toggleInlineStyle(style);
      } else if (type === CONSTANTS.TOOLBAR_TYPES.BLOCK) {
        toggleBlockType(style);
      }
    },
    [toggleInlineStyle, toggleBlockType]
  );

  // Xử lý căn chỉnh text - giữ nguyên kiểu block
  const setBlockAlignment = useCallback(
    (alignment) => {
      const { baseType } = getCurrentStyles();
      const newCombinedType = createBlockType(baseType, "align-" + alignment);

      setEditorState(RichUtils.toggleBlockType(editorState, newCombinedType));
    },
    [editorState, getCurrentStyles]
  );

  // Xử lý lịch sử và lưu
  const handleHistoryAction = useCallback(
    (action) => {
      switch (action) {
        case "undo":
          setEditorState(EditorState.undo(editorState));
          break;
        case "redo":
          setEditorState(EditorState.redo(editorState));
          break;
        case "save":
          if (onSave) {
            const contentState = editorState.getCurrentContent();
            const rawContent = convertToRaw(contentState);
            onSave(JSON.stringify(rawContent));
          }
          break;
        default:
          break;
      }
    },
    [editorState, onSave]
  );

  // Xử lý media
  const handleMediaInsert = useCallback((mediaType) => {
    setCurrentMediaType(mediaType);
    setImageManageOpen(true);
  }, []);

  const handleSelectMediaFromLibrary = useCallback(
    (mediaUrl) => {
      const contentState = editorState.getCurrentContent();
      // Xác định loại media từ URL hoặc param đã set
      const mediaType =
        currentMediaType ||
        (mediaUrl.match(/\.(mp3|wav|ogg)$/i) ? "AUDIO" : "IMAGE");

      const contentWithEntity = contentState.createEntity(
        mediaType,
        "IMMUTABLE",
        { src: mediaUrl }
      );

      const entityKey = contentWithEntity.getLastCreatedEntityKey();
      const newEditorState = AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        " "
      );

      setEditorState(newEditorState);
      setImageManageOpen(false);
    },
    [editorState, currentMediaType]
  );

  // Renderer cho các block đặc biệt
  const blockRendererFn = useCallback(
    (block) => {
      if (block.getType() === "atomic") {
        return {
          component: MediaComponent,
          editable: false,
          props: {
            contentState: editorState.getCurrentContent(),
          },
        };
      }
      return null;
    },
    [editorState]
  );

  // Quản lý style cho các block
  const blockStyleFn = useCallback((block) => {
    const blockType = block.getType();
    const { baseType, alignment } = parseBlockType(blockType);
    let className = "";

    // Set alignment class
    if (alignment !== CONSTANTS.ALIGNMENTS.LEFT) {
      className += `text-${alignment} `;
    }

    // Set specific block styles
    switch (baseType) {
      case "blockquote":
        className += "border-l-4 border-gray-300 pl-4 italic my-2 ";
        break;
      case "code-block":
        className += "bg-gray-100 p-2 font-mono text-sm my-2 rounded ";
        break;
      case "header-one":
        className += "text-4xl font-bold my-2 ";
        break;
      case "header-two":
        className += "text-3xl font-bold my-2 ";
        break;
      case "header-three":
        className += "text-2xl font-bold my-2 ";
        break;
      case "header-four":
        className += "text-xl font-bold my-2 ";
        break;
      case "header-five":
        className += "text-lg font-bold my-2 ";
        break;
      case "header-six":
        className += "text-base font-bold my-2 ";
        break;
      case "unordered-list-item":
        className += "list-disc ml-5 ";
        break;
      case "ordered-list-item":
        className += "list-decimal ml-5 ";
        break;
      default:
        className += "leading-normal ";
        break;
    }

    return className.trim();
  }, []);

  // Xử lý phím tắt
  const handleKeyCommand = useCallback((command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  }, []);

  // Merge tất cả style map
  const mergedStyleMap = useMemo(
    () => ({
      ...customStyleMap,
      ...fontStyleMap,
      ...fontFamilyStyleMap,
    }),
    [customStyleMap, fontStyleMap, fontFamilyStyleMap]
  );

  // Lấy current styles để highlight active buttons
  const { fullBlockType, baseType, alignment, inlineStyle } =
    getCurrentStyles();

  // Debug helper
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {

    }
  }, [fullBlockType, baseType, alignment]);

  return (
    <div
      className={`${width} ${border ? "border border-gray-300" : ""
        } p-2 rounded-md`}
    >
      {/* Debug Panel (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-gray-100 p-2 mb-2 text-xs">
          <p>Full Block Type: {fullBlockType}</p>
          <p>Base Type: {baseType}</p>
          <p>Alignment: {alignment}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-2 bg-gray-50 p-2 rounded">
        {/* Font Controls */}
        <FontControls
          fontFamily={fontFamily}
          fontSize={fontSize}
          onChangeFontFamily={handleFontChange}
          onChangeFontSize={handleFontSizeChange}
        />

        <Divider />

        {/* History Controls */}
        {HISTORY_ACTIONS.map(({ Icon, action, label }) => (
          <ToolbarButton
            key={action}
            icon={Icon}
            label={label}
            onClick={() => handleHistoryAction(action)}
          />
        ))}

        <Divider />

        {/* Style Controls */}
        {TOOLBAR_CONFIG.map(({ Icon, style, type, label }) => (
          <ToolbarButton
            key={style}
            icon={Icon}
            label={label}
            active={
              type === CONSTANTS.TOOLBAR_TYPES.INLINE
                ? inlineStyle.has(style)
                : baseType === style
            }
            onClick={() => toggleStyle(style, type)}
          />
        ))}

        <Divider />

        {/* Alignment Controls */}
        {ALIGNMENT_CONFIG.map(({ Icon, alignment: alignValue, label }) => (
          <ToolbarButton
            key={alignValue}
            icon={Icon}
            label={label}
            active={alignment === alignValue}
            onClick={() => setBlockAlignment(alignValue)}
          />
        ))}

        <Divider />

        {/* Media Controls */}
        {MEDIA_CONFIG.map(({ id, Icon, mediaType, label }) => (
          <ToolbarButton
            key={id}
            icon={Icon}
            label={label}
            onClick={() => handleMediaInsert(mediaType)}
          />
        ))}
      </div>

      {/* Image Manager */}
      <ImageManager
        isOpen={isImageManageOpen}
        onClose={() => setImageManageOpen(false)}
        onSelectImage={handleSelectMediaFromLibrary}
      />

      {/* Editor Content */}
      <div
        className={`min-h-[${height}] border border-gray-300 p-2 cursor-text rounded`}
        onClick={() => editorRef.current?.focus()}
      >
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          customStyleMap={mergedStyleMap}
          blockRendererFn={blockRendererFn}
          blockRenderMap={blockRenderMap}
          blockStyleFn={blockStyleFn}
          spellCheck
          placeholder="Start typing here..."
        />
      </div>
    </div>
  );
};

export default React.memo(CustomEditor);
