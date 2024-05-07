import { FlexMessage } from "@line/bot-sdk/dist/messaging-api/api";
import { t } from "i18next";

export default function bookingSystem(uri: string): FlexMessage {
    return {
        "type": "flex",
        "altText": t("title.booking_system"),
        "contents": {
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": t("title.booking_system"),
                        "weight": "bold",
                        "size": "xl"
                    },
                    {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "lg",
                        "spacing": "sm",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "baseline",
                                "spacing": "sm",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "This is a demo.",
                                        "color": "#aaaaaa",
                                        "size": "sm",
                                        "flex": 1
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            "footer": {
                "type": "box",
                "layout": "vertical",
                "spacing": "sm",
                "contents": [
                    {
                        "type": "button",
                        "style": "link",
                        "height": "sm",
                        "action": {
                            "type": "uri",
                            "label": t("button.book"),
                            "uri": uri,
                        }
                    }
                ],
                "flex": 0
            }
        }
    };
};