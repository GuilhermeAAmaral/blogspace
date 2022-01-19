import { GetStaticProps } from 'next';
import Link from 'next/link';
import Header from '../components/Header';
import { FiCalendar, FiUser } from 'react-icons/fi'
import Prismic from '@prismicio/client'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Head from 'next/head';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination,
  preview: boolean
}

export default function Home({ postsPagination, preview }: HomeProps): JSX.Element {

  const formattedPost = postsPagination.results.map(posts => {
    return {
      ...posts,
      first_publication_date: format(
        new Date(posts.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR
        }
      )
    }
  })

  const [posts, setPosts] = useState<Post[]>(formattedPost)

  const [nextPage, setNextPage] = useState(postsPagination.next_page)
  const [currentPage, setCurrentPage] = useState(1)

  const handleNextPage = async (): Promise<void> => {

    if (currentPage != 1 && nextPage === null) {
      return
    }

    const postResults = await fetch(`${nextPage}`)
      .then((res) => res.json())

    setNextPage(postResults.next_page)
    setCurrentPage(postResults.page)

    const newPosts = postResults.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR
          }
        ),

        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author
        }
      }
    })

    setPosts([...posts, ...newPosts])
  }

  return (
    <>
      <Head>
        <title>Home | Spacetraveling </title>
      </Head>

      <main className={commonStyles.container}>
        <Header />

        <div className={styles.posts}>
          {posts.map(post => {
            return (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a className={styles.post}>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <ul>
                    <li>
                      <FiCalendar />
                      <span>{post.first_publication_date}</span>
                    </li>
                    <li>
                      <FiUser />
                      <span>{post.data.author}</span>
                    </li>
                  </ul>
                </a>
              </Link>
            )
          })}
          {nextPage && (
            <button
              type="button"
              onClick={handleNextPage}
            >
              Carregar mais posts
            </button>
          )}

          {preview && (
            <aside>
              <Link href="/api/exit-preview">
                <a
                  className={commonStyles.preview}
                >
                  Sair do modo Preview
                </a>
              </Link>
            </aside>
          )}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {

  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 2
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,

      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts
  }

  return {
    props: {
      postsPagination,
      preview
    }
  }

};
