import React, { useRef, useEffect, useState } from 'react';

interface SmartTimeInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    className?: string;
    placeholder?: string;
}

export const SmartTimeInput: React.FC<SmartTimeInputProps> = ({
    value,
    onChange,
    onBlur,
    className = "",
    placeholder = "HH:mm"
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        const nativeEvent = e.nativeEvent as InputEvent;
        const inputType = nativeEvent.inputType;

        // Allow backspace/delete freely
        if (inputType === 'deleteContentBackward' || inputType === 'deleteContentForward') {
            setLocalValue(newVal);
            onChange(newVal);
            return;
        }

        // Only allow digits and colon
        if (!/^[\d:]*$/.test(newVal)) return;

        // Smart Logic

        // 1. If typing single digit 3-9, assume 03:00 - 09:00
        // But only if starting from empty or similar? 
        // We need to be careful not to trigger this when backspacing.
        // Check selection start to see where we are typing?
        // Actually simpler: process the string.

        let processed = newVal;

        // If length 1 and char is 3-9, prepend 0 and append :
        // e.g. "3" -> "03:"
        if (newVal.length === 1 && /^[3-9]$/.test(newVal)) {
            processed = `0${newVal}:`;
        }

        // If length 2 and valid hour, append :
        // e.g. "11" -> "11:"
        // But wait, "1" could become "11". "1" could become "12".
        // If I type "1" then "2" -> "12". Done.
        // If I type "2" then "4" -> "24" (Invalid? No, "For 13-24...").
        // "24" is technically invalid for time (00-23).
        // So if newVal is "24", reject or cap? 
        // User says "simplest is to disallow 24".

        if (newVal.length === 2 && !newVal.includes(':')) {
            const num = parseInt(newVal, 10);
            if (num >= 24) {
                // Invalid hour, don't update? Or keep as is?
                // Let's prevent update if > 24 could be typed?
                // e.g. user typed '2' then '5'.
                // We revert to '2'.
                // But wait, maybe they want to backspace '2' and type '5'? 
                // It's tricky to block.
            } else {
                // Valid hour, append colon
                processed = `${newVal}:`;
            }
        }

        // If length 3 and 3rd char is numeric (user typed "113"), insert colon
        // "113" -> "11:3"
        // Regex for 3 digits
        if (/^\d{3}$/.test(newVal)) {
            processed = `${newVal.slice(0, 2)}:${newVal.slice(2)}`;
        }

        // Validation on parts
        const parts = processed.split(':');
        if (parts[0].length === 2) {
            const h = parseInt(parts[0], 10);
            if (h > 23) {
                // Don't allowing typing invalid hour part
                // Exception: user pasted it?
                // For typing, reverting is safer.
                return;
            }
        }
        if (parts[1] && parts[1].length > 0) {
            // Minutes part
            // If first digit of minute > 5, it's invalid (e.g. 11:6...)
            if (parseInt(parts[1][0], 10) > 5) {
                return;
            }
            if (parts[1].length > 2) {
                // Prevent more than 2 digits for minutes
                processed = processed.substring(0, 5);
            }
        }

        setLocalValue(processed);
        onChange(processed);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        // Here we apply the "1130" -> "11:30" logic or padding if not caught by smart typing
        // Also the helper normalizeTimeInput does most of this.
        if (onBlur) onBlur(e);

        // We can also sync local value with refined value from parent if parent cleaned it
        // But parent usually passes value back.
    };

    return (
        <input
            ref={inputRef}
            type="text"
            className={`${className}`}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={5} // HH:mm
        />
    );
};
