import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  return (
    <main>
      <div>
        {postsPagination.results.map(post => (
          <Link key={post.uid} href={`/posts/${post.uid}`}>
            <a>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>
              <div>
                <time>
                  <FiCalendar />{' '}
                  {format(
                    Date.parse(post.first_publication_date),
                    'd MMM de yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <p>
                  <FiUser /> {post.data.author}
                </p>
              </div>
            </a>
          </Link>
        ))}
      </div>
      {postsPagination.next_page && <div>Carregar mais posts</div>}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'pos')],
    {
      fetch: [
        'pos.title',
        'pos.subtitle',
        'pos.author',
        'pos.banner',
        'pos.content',
      ],
      pageSize: 100,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      posts,
    },
  };
};
