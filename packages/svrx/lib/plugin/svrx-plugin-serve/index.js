const send = require('koa-send');
const c2k = require('koa2-connect');
const serveIndex = require('serve-index');
const historyApiFallback = require('koa-history-api-fallback');

const { PRIORITY } = require('../../constant');

const ACCEPT_METHOD = /^(?:GET|HEAD)$/i;

module.exports = {
    priority: PRIORITY.SERVE,
    hooks: {
        async onCreate({ middleware, config }) {
            // serve index
            const serveIndexMiddleware = c2k(serveIndex(config.get('root'), { icons: true }));

            middleware.add('$serve-index', {
                priority: PRIORITY.SERVE,
                onCreate: () => async (ctx, next) => {
                    if (!ACCEPT_METHOD.test(ctx.method) || ctx.status !== 404 || ctx.body != null) {
                        return next();
                    }
                    return serveIndexMiddleware(ctx, next);
                }
            });

            // historyApiFallback
            const historyApiFallbackOptions = config.get('serve.historyApiFallback');
            if (historyApiFallbackOptions) {
                const historyApiFallbackMiddleware = historyApiFallback(
                    historyApiFallbackOptions === true ? {} : historyApiFallbackOptions
                );
                middleware.add('$serve-history-api-fallback', {
                    priority: PRIORITY.SERVE,
                    onCreate: () => async (ctx, next) => {
                        return historyApiFallbackMiddleware(ctx, next);
                    }
                });
            }
        },

        async onRoute(ctx, next, { config }) {
            await next();

            if (!ACCEPT_METHOD.test(ctx.method) || ctx.status !== 404 || ctx.body != null) return;

            const serveConfig = config.get('serve');
            const root = config.get('serve.base') || config.get('root');
            const headers = config.get('serve.headers') || {};

            if (serveConfig === false) return;

            Object.keys(headers).forEach((key) => {
                ctx.set(key, headers[key]);
            });

            try {
                await send(ctx, ctx.path, {
                    root,
                    gzip: false
                });
            } catch (err) {
                if (err.status !== 404) {
                    throw err;
                }
            }
        }
    }
};
