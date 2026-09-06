/*
 * vite配置
 *
 * @Author:    1024创新实验室-主任：卓大
 * @Date:      2022-05-02 23:44:56
 * @Wechat:    zhuda1024
 * @Email:     lab1024@163.com
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
 */
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import customVariables from '/@/theme/custom-variables.js';

const pathResolve = (dir) => {
  return resolve(__dirname, '.', dir);
};

export default () => {
  return {
    base: process.env.NODE_ENV === 'production' ? '/' : '/',
    root: process.cwd(),
    resolve: {
      alias: [
        // 国际化替换
        {
          find: 'vue-i18n',
          replacement: 'vue-i18n/dist/vue-i18n.cjs.js',
        },
        // 绝对路径重命名：/@/xxxx => src/xxxx
        {
          find: /\/@\//,
          replacement: pathResolve('src') + '/',
        },
        {
          find: /^~/,
          replacement: '',
        },
      ],
    },
    server: {
      host: '0.0.0.0',
      port: 8081,
    },
    plugins: [vue()],
    // esbuild 压缩 + 丢弃 console/debugger，构建速度显著快于 terser
    esbuild: {
      drop: ['console', 'debugger'],
    },
    optimizeDeps: {
      include: ['ant-design-vue/es/locale/zh_CN', 'dayjs/locale/zh-cn', 'ant-design-vue/es/locale/en_US'],
      exclude: ['vue-demi'],
    },
    build: {
      // 跳过构建结束时的 gzip 体积计算，加快构建
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          //配置这个是让不同类型文件放在不同文件夹，不会显得太乱
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            // 大型依赖单独分包（利用浏览器长期缓存）；
            // 其余依赖返回 undefined 交给 Rollup 按引用关系自动分包，跟随页面懒加载，
            // 避免此前“每个 npm 包一个 chunk”导致首屏几十上百个请求
            if (id.includes('node_modules')) {
              if (id.includes('ant-design-vue') || id.includes('@ant-design')) {
                return 'antd-vendor';
              }
              if (id.includes('echarts') || id.includes('zrender')) {
                return 'echarts';
              }
              if (id.includes('@wangeditor-next')) {
                return 'wangeditor';
              }
              return undefined;
            }
          },
        },
      },
      target: 'esnext',
      outDir: 'dist', // 指定输出目录
      assetsDir: 'assets', // 指定生成静态文件目录
      assetsInlineLimit: '4096', // 小于此阈值的导入或引用资源将内联为 base64 编码
      chunkSizeWarningLimit: 1500, // chunk 大小警告的限制
      emptyOutDir: true, //打包前先清空原有打包文件
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: customVariables,
          javascriptEnabled: true,
        },
      },
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
    },
  };
};
