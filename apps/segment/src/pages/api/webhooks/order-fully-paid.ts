import { createSegmentClientForWebhookContext } from "@/modules/create-segment-client-for-webhook-context";
import { trackingEventFactory } from "@/modules/tracking-events/tracking-events";
import { saleorApp } from "@/saleor-app";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  OrderFullyPaidDocument,
  OrderFullyPaidSubscriptionPayloadFragment,
} from "../../../../generated/graphql";

import { SegmentNotConfiguredError } from "@/errors";
import * as Sentry from "@sentry/nextjs";
import { createLogger } from "@saleor/apps-shared";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const orderFullyPaidWebhook =
  new SaleorAsyncWebhook<OrderFullyPaidSubscriptionPayloadFragment>({
    name: "Order Fully Paid  v1",
    webhookPath: "api/webhooks/order-fully-paid",
    event: "ORDER_FULLY_PAID",
    apl: saleorApp.apl,
    query: OrderFullyPaidDocument,
  });

const logger = createLogger({ name: "orderFullyPaidWebhook" });

const handler: NextWebhookApiHandler<OrderFullyPaidSubscriptionPayloadFragment> = async (
  req,
  res,
  context,
) => {
  const { authData, payload } = context;

  if (!payload.order) {
    Sentry.captureException(new Error("Order not found in payload. This should not happen."));

    return res.status(200).end();
  }

  try {
    const segmentEventTracker = await createSegmentClientForWebhookContext({ authData });

    logger.info("Sending order fully paid event to Segment");

    await segmentEventTracker.trackEvent(
      trackingEventFactory.createOrderCompletedEvent(payload.order),
    );

    return res.status(200).end();
  } catch (e) {
    if (e instanceof SegmentNotConfiguredError) {
      // todo disable webhooks if not configured

      return res.status(200).end();
    }

    Sentry.captureException(e);

    return res.status(500).end();
  }
};

export default orderFullyPaidWebhook.createHandler(handler);
