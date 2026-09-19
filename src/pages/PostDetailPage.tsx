import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Post } from "../types";
import { getStoredPosts } from "../data/store";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Check,
  Sparkles,
  ChevronRight,
  Phone,
} from "lucide-react";
import { usePageSEO } from "../hooks/usePageSEO";

export const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [copied, setCopied] = useState(false);

  usePageSEO({
    title: post ? `${post.title} | Terre Spa` : "Chi tiết bài viết | Terre Spa",
    description: post ? post.excerpt : "Đọc bài viết chia sẻ kiến thức chăm sóc sức khỏe và làm đẹp tại Terre Spa.",
    keywords: post?.tags?.join(", "),
    ogImage: post?.coverImage,
    ogType: "article",
    canonicalUrl: post ? `https://terre-spa.vercel.app/posts/${post.slug || post.id}` : undefined,
    structuredData: post
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": post.excerpt,
          "image": [post.coverImage],
          "datePublished": post.publishedAt,
          "dateModified": post.updatedAt || post.publishedAt,
          "author": [
            {
              "@type": "Person",
              "name": post.author.name,
              "jobTitle": post.author.role || "Chuyên viên Terre Spa",
            },
          ],
          "publisher": {
            "@type": "Organization",
            "name": "Terre Spa",
            "logo": {
              "@type": "ImageObject",
              "url": "https://terre-spa.vercel.app/src/assets/images/logo-terre-removebg.png",
            },
          },
        }
      : undefined,
  });

  useEffect(() => {
    const allPosts = getStoredPosts();
    const found = allPosts.find((p) => p.id === id || p.slug === id);
    if (found) {
      setPost(found);
      // Related posts
      const related = allPosts
        .filter((p) => p.id !== found.id && p.category === found.category)
        .slice(0, 3);
      setRelatedPosts(related.length > 0 ? related : allPosts.filter((p) => p.id !== found.id).slice(0, 3));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-brand-50 flex flex-col font-sans text-brand-950">
        <Navbar />
        <main className="flex-1 pt-32 pb-16 flex items-center justify-center px-4">
          <div className="bg-white p-10 rounded-3xl border border-brand-200 text-center max-w-md space-y-4 shadow-xl">
            <h2 className="text-2xl font-serif font-bold text-brand-900">Không tìm thấy bài viết</h2>
            <p className="text-xs text-brand-600">
              Bài viết này có thể đã bị gỡ bỏ hoặc đường dẫn không còn tồn tại.
            </p>
            <Link
              to="/posts"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bài viết
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col font-sans text-brand-950">
      <Navbar />

      <main className="flex-1 pt-24 md:pt-32 pb-20">
        {/* Article Breadcrumb & Back */}
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-6">
          <div className="flex items-center justify-between">
            <Link
              to="/posts"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700 hover:text-brand-950 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Tất cả bài viết
            </Link>

            <span className="text-xs text-brand-500 font-medium">
              Chuyên mục: <strong className="text-brand-800">{post.category}</strong>
            </span>
          </div>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-brand-100/80 text-brand-800 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" /> {post.category}
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-950 leading-tight tracking-tight">
              {post.title}
            </h1>

            {/* Post Meta */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-brand-600 border-y border-brand-200/70 py-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-200 text-brand-900 font-serif font-bold text-xs flex items-center justify-center">
                  {post.author.name[0]}
                </div>
                <span className="font-semibold text-brand-900">{post.author.name}</span>
                {post.author.role && <span className="text-brand-400">({post.author.role})</span>}
              </div>

              <span>•</span>

              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-500" />
                {new Date(post.publishedAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>

              <span>•</span>

              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                {post.readTimeMinutes || 5} phút đọc
              </div>
            </div>
          </motion.div>

          {/* Cover Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="my-10 rounded-3xl overflow-hidden shadow-2xl shadow-brand-950/10 border border-brand-200/70 aspect-16/9 bg-brand-100"
          >
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Lead Excerpt */}
          {post.excerpt && (
            <div className="p-6 md:p-8 bg-brand-100/50 rounded-2xl border-l-4 border-brand-800 text-brand-900 font-serif italic text-base md:text-lg leading-relaxed mb-10">
              "{post.excerpt}"
            </div>
          )}

          {/* WYSIWYG HTML Content Body */}
          <div className="bg-white rounded-3xl p-6 md:p-12 border border-brand-200/80 shadow-xs">
            <div
              className="wysiwyg-content prose prose-brand max-w-none text-brand-950 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-8 mt-10 border-t border-brand-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700 mr-2">
                  Thẻ bài viết:
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-brand-50 border border-brand-200 text-brand-800 px-3 py-1 rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Share & Actions */}
            <div className="pt-6 mt-6 border-t border-brand-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-xl text-xs font-semibold transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-700" /> : <Share2 className="w-4 h-4" />}
                  {copied ? "Đã sao chép link!" : "Chia sẻ bài viết"}
                </button>
              </div>

              <span className="text-xs text-brand-400 font-serif italic">
                Terre Spa — Chạm vào an yên
              </span>
            </div>
          </div>

          {/* Author Signature Box */}
          <div className="my-10 bg-white rounded-3xl p-6 md:p-8 border border-brand-200 shadow-xs flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-brand-200 text-brand-900 font-serif font-bold text-2xl flex items-center justify-center shrink-0 border-2 border-brand-300">
              {post.author.name[0]}
            </div>
            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block">
                Tác giả bài viết
              </span>
              <h3 className="font-serif font-bold text-lg text-brand-950">{post.author.name}</h3>
              <p className="text-xs text-brand-600 leading-relaxed">
                {post.author.role || "Chuyên viên chăm sóc sức khỏe & sắc đẹp tại Terre Spa. Đồng hành cùng bạn trên hành trình chăm sóc thân & tâm."}
              </p>
            </div>
            <a
              href="/#book"
              className="shrink-0 px-5 py-2.5 bg-brand-900 hover:bg-brand-950 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
            >
              Đặt lịch hẹn
            </a>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="my-16 space-y-6">
              <div className="flex items-center justify-between border-b border-brand-200 pb-3">
                <h3 className="font-serif font-bold text-2xl text-brand-900">
                  Bài viết cùng chủ đề
                </h3>
                <Link
                  to="/posts"
                  className="text-xs font-semibold text-brand-700 hover:text-brand-950 uppercase tracking-wider flex items-center gap-1"
                >
                  Xem thêm <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {relatedPosts.map((rPost) => (
                  <Link
                    key={rPost.id}
                    to={`/posts/${rPost.id}`}
                    className="bg-white rounded-2xl overflow-hidden border border-brand-100 shadow-xs hover:shadow-lg transition-all group flex flex-col"
                  >
                    <div className="aspect-16/10 overflow-hidden bg-brand-100">
                      <img
                        src={rPost.coverImage}
                        alt={rPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                      <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                        {rPost.category}
                      </span>
                      <h4 className="font-serif font-semibold text-sm text-brand-950 line-clamp-2 group-hover:text-brand-700 transition-colors">
                        {rPost.title}
                      </h4>
                      <p className="text-[11px] text-brand-500 pt-2 border-t border-brand-50">
                        {new Date(rPost.publishedAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Bottom Booking Banner */}
          <div className="my-12 bg-linear-to-br from-brand-900 via-brand-800 to-brand-950 text-white rounded-3xl p-8 md:p-10 text-center space-y-4 shadow-xl">
            <h3 className="text-2xl font-serif font-bold text-white">
              Trải nghiệm dịch vụ trực tiếp tại Terre Spa
            </h3>
            <p className="text-brand-200 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
              Hãy để Terre lắng nghe và chăm sóc cơ thể bạn sau những giờ làm việc mệt mỏi.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <a
                href="/#book"
                className="px-6 py-3 bg-white text-brand-950 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-50 transition-all shadow-md"
              >
                Đặt lịch trực tuyến
              </a>
              <a
                href="tel:0569087777"
                className="px-6 py-3 border border-brand-400 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" /> Hotline: 0569 08 7777
              </a>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default PostDetailPage;
