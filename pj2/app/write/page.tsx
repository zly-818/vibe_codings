'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export default function WritePage() {
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('碎碎念')
  const [isAnonymous, setIsAnonymous] = useState(true) // 默认选匿名
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 1. 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('请先登录！')
      router.push('/test') // 没登录的话跳去测试页登录
      return
    }

    // 2. 往数据库里插入信件
    const { error } = await supabase.from('letters').insert({
      content,
      category,
      is_public: true,
      device_id: user.id, // 数据库里必须留底（方便后台追溯）
      // 这里我们假设未来会有一个 author_name 字段，现在先写死
    })

    if (error) {
      alert('发送失败：' + error.message)
    } else {
      alert('信件投递成功！')
      router.push('/') // 成功后跳回首页（现在首页还没做，先这样）
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>投递一封信</h1>
      
      <form onSubmit={handleSubmit}>
        {/* 分类选择 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>信件标签：</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '8px', width: '100%', color: 'black' }}
          >
            <option value="学业压力">学业压力</option>
            <option value="人际关系">人际关系</option>
            <option value="自我内耗">自我内耗</option>
            <option value="未来迷茫">未来迷茫</option>
            <option value="碎碎念">碎碎念</option>
          </select>
        </div>

        {/* 信件内容 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>信件内容（100-600字）：</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="把你想说的写在这里..."
            style={{ width: '100%', padding: '10px', color: 'black' }}
            required
          />
        </div>

        {/* 匿名选项 */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input 
            type="checkbox" 
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="anonymous">匿名发布（别人将看不到你的任何信息）</label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', padding: '12px', 
            backgroundColor: loading ? 'gray' : '#10b981', 
            color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px'
          }}
        >
          {loading ? '正在投递...' : '投递出去'}
        </button>
      </form>
    </div>
  )
}