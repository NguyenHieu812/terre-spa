import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Post } from "../types";
import { getStoredPosts, TERRE_DATA_SYNCED_EVENT } from "../data/store";
import {
  Sparkles,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Tag,
} from "lucide-react";
import { usePageSEO } from "../hooks/usePageSEO";

export const PostsPage: React.FC = () => {
  usePageSEO({
    title: "Bài Viết & Bí Quyết Dưỡng Sinh Spa | Terre Spa",
    description: "Khám phá kiến thức chuyên sâu về gội đầu dưỡng sinh Đông Y, chăm sóc da mụn nhạy cảm, massage bấm huyệt và lối sống an yên từ Terre Spa.",
    keywords: "bài viết terre spa, cẩm nang spa, bí quyết dưỡng sinh, phục hồi da sau treatment, gội đầu dưỡng sinh đông y",
    canonicalUrl: "https://terre-spa.vercel.app/posts",
  });
  const [posts, setPosts] = useState<Post[]>(() => getStoredPosts().filter((p) => p.status === "published"));
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const updatePosts = () => {
      setPosts(getStoredPosts().filter((p) => p.status === "published"));
    };
    updatePosts();

    window.addEventListener(TERRE_DATA_SYNCED_EVENT, updatePosts);
    return () => {
      window.removeEventListener(TERRE_DATA_SYNCED_EVENT, updatePosts);
    };
  }, []);

  const categories = [
    "all",
    ...Array.from(new Set(posts.map((p) => p.category))),
  ];

  const filteredPosts = posts.filter((post) => {
    const matchCat = selectedCategory === "all" || post.category === selectedCategory;
    const matchQuery =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  const featuredPost = posts.find((p) => p.featured) || posts[0];
  const regularPosts = filteredPosts.filter((p) => p.id !== (selectedCategory === "all" && !searchQuery ? featuredPost?.id : ""));

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col font-sans text-brand-950">
      <Navbar />

      <main className="flex-1 pt-24 md:pt-32 pb-16">
        {/* Header Section */}
        <section className="py-12 md:py-16 px-4 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-200/35 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-3xl mx-auto space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-brand-200 text-brand-800 text-[10px] uppercase tracking-widest rounded-full font-semibold shadow-xs"
            >
              <Sparkles className="w-3 h-3 text-brand-600" /> Cẩm Nang Dưỡng Thân &amp; Tâm
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-serif text-brand-900 font-medium leading-tight tracking-wide"
            >
              Bài Viết &amp; Bí Quyết Spa
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-brand-700 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
            >
              Chia sẻ kiến thức chuyên sâu về dưỡng sinh Đông y, phục hồi làn da và phong cách sống cân bằng, an yên từ chuyên gia Terre.
            </motion.p>
            <div className="w-12 h-px bg-brand-400 mx-auto pt-2" />
          </div>
        </section>

        {/* Featured Hero Article (when on All and no search) */}
        {selectedCategory === "all" && !searchQuery && featuredPost && (
          <section className="max-w-6xl mx-auto px-4 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl overflow-hidden border border-brand-100 shadow-xl shadow-brand-950/5 grid md:grid-cols-12 gap-0 group"
            >
              <div className="md:col-span-7 aspect-16/10 md:aspect-auto min-h-[340px] overflow-hidden relative">
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <span className="absolute top-4 left-4 bg-brand-900 text-white text-[10px] uppercase font-bold tracking-widest px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Bài viết tiêu điểm
                </span>
              </div>

              <div className="md:col-span-5 p-8 md:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs text-brand-500 font-medium">
                    <span className="text-brand-800 font-bold uppercase tracking-wider bg-brand-100 px-2.5 py-0.5 rounded-md">
                      {featuredPost.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {featuredPost.readTimeMinutes || 5} phút đọc
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-950 leading-tight group-hover:text-brand-700 transition-colors">
                    <Link to={`/posts/${featuredPost.slug || featuredPost.id}`}>{featuredPost.title}</Link>
                  </h2>

                  <p className="text-xs md:text-sm text-brand-600 leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-brand-200 flex items-center justify-center font-serif text-brand-900 font-bold text-sm">
                      {featuredPost.author.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-900">{featuredPost.author.name}</p>
                      <p className="text-[10px] text-brand-500">{featuredPost.author.role}</p>
                    </div>
                  </div>

                  <Link
                    to={`/posts/${featuredPost.slug || featuredPost.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-900 hover:bg-brand-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
                  >
                    Đọc tiếp <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* Filters & Search */}
        <section className="max-w-6xl mx-auto px-4 mb-10">
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-brand-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-brand-900 text-white shadow-sm"
                      : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                  }`}
                >
                  {cat === "all" ? "Tất cả chủ đề" : cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
              <input
                type="text"
                placeholder="Tìm bài viết, mẹo dưỡng sinh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 bg-brand-50/30"
              />
            </div>
          </div>
        </section>

        {/* Regular Posts Grid */}
        <section className="max-w-6xl mx-auto px-4">
          {regularPosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-brand-200 space-y-4 max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-brand-300 mx-auto" />
              <p className="font-serif text-lg text-brand-900">Không tìm thấy bài viết phù hợp</p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-brand-800 text-white rounded-xl text-xs font-semibold"
              >
                Xem tất cả bài viết
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden border border-brand-100 shadow-sm hover:shadow-xl hover:shadow-brand-950/5 transition-all duration-300 flex flex-col group"
                >
                  <Link to={`/posts/${post.slug || post.id}`} className="aspect-16/10 overflow-hidden bg-brand-100 relative block">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-brand-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                      {post.category}
                    </span>
                  </Link>

                  <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-[11px] text-brand-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {post.readTimeMinutes || 5} phút
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-lg text-brand-950 group-hover:text-brand-700 transition-colors line-clamp-2 leading-snug">
                        <Link to={`/posts/${post.slug || post.id}`}>{post.title}</Link>
                      </h3>

                      <p className="text-xs text-brand-600 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-brand-100 flex items-center justify-between">
                      <span className="text-xs text-brand-700 font-medium">{post.author.name}</span>
                      <Link
                        to={`/posts/${post.slug || post.id}`}
                        className="text-xs font-semibold text-brand-900 hover:text-brand-600 flex items-center gap-1 uppercase tracking-wider group-hover:translate-x-0.5 transition-transform"
                      >
                        Đọc bài <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        {/* Spa CTA Section */}
        <section className="max-w-4xl mx-auto px-4 mt-20">
          <div className="bg-linear-to-r from-brand-900 to-brand-950 text-white rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-700/20 rounded-full blur-3xl pointer-events-none" />
            <h3 className="text-2xl md:text-3xl font-serif font-medium text-white">
              Cảm nhận sự an yên trọn vẹn tại Terre Spa
            </h3>
            <p className="text-brand-200 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
              Đặt lịch hẹn ngay hôm nay để tận hưởng các liệu pháp gội đầu dưỡng sinh và chăm sóc phục hồi chuyên biệt.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <a
                href="/#book"
                className="px-8 py-3.5 bg-white text-brand-950 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-brand-50 transition-all shadow-md active:scale-95"
              >
                Đặt lịch hẹn ngay
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PostsPage;
